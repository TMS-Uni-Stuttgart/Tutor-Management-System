import { EntityRepository } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FormDataResponse } from 'shared/model/FormTypes';
import {
    CriteriaInformation,
    IScheinCriteria,
    ScheinCriteriaSummary as ScheincriteriaSummary,
    ScheincriteriaSummaryByStudents,
    SingleScheincriteriaSummaryByStudents,
} from 'shared/model/ScheinCriteria';
import { StudentStatus } from 'shared/model/Student';
import { ScheincriteriaEntity } from '../../database/entities/scheincriteria.entity';
import { Scheinexam } from '../../database/entities/scheinexam.entity';
import { Sheet } from '../../database/entities/sheet.entity';
import { ShortTest } from '../../database/entities/shorttest.entity';
import { Student } from '../../database/entities/student.entity';
import { CRUDService } from '../../helpers/CRUDService';
import { ScheinexamService } from '../scheinexam/scheinexam.service';
import { SheetService } from '../sheet/sheet.service';
import { ShortTestService } from '../short-test/short-test.service';
import { GradingService, StudentAndGradings } from '../student/grading.service';
import { StudentService } from '../student/student.service';
import { TutorialService } from '../tutorial/tutorial.service';
import { Scheincriteria } from './container/Scheincriteria';
import { ScheincriteriaContainer } from './container/scheincriteria.container';
import { ScheinCriteriaDTO } from './scheincriteria.dto';

interface CalculationParams {
    criterias: ScheincriteriaEntity[];
    exams: Scheinexam[];
    sheets: Sheet[];
    shortTests: ShortTest[];
}

interface SingleStudentCalculationParams extends CalculationParams {
    studentInfo: StudentAndGradings;
}

interface MultipleStudentsCalculationParams extends CalculationParams {
    studentInfos: StudentAndGradings[];
}

interface GetRequiredDocsParams {
    criteriaId?: string;
    studentId?: string;
    tutorialId?: string;
}

@Injectable()
export class ScheincriteriaService
    implements CRUDService<IScheinCriteria, ScheinCriteriaDTO, ScheincriteriaEntity>
{
    constructor(
        private readonly studentService: StudentService,
        private readonly sheetService: SheetService,
        private readonly scheinexamService: ScheinexamService,
        private readonly tutorialService: TutorialService,
        private readonly shortTestService: ShortTestService,
        private readonly gradingService: GradingService,
        @InjectRepository(ScheincriteriaEntity)
        private readonly repository: EntityRepository<ScheincriteriaEntity>,
        @Inject(EntityManager)
        private readonly em: EntityManager
    ) {}

    /**
     * @returns All scheincriterias saved in the database.
     */
    async findAll(): Promise<ScheincriteriaEntity[]> {
        return this.repository.findAll();
    }

    /**
     * Searches for and returns the scheincriteria with the given ID.
     *
     * @param id ID to search for.
     *
     * @returns ScheincriteriaDocument with the given ID.
     *
     * @throws `NotFoundException` - If no scheincriteria could be found with the given ID.
     */
    async findById(id: string): Promise<ScheincriteriaEntity> {
        const criteria = await this.repository.findOne({
            id,
        });

        if (!criteria) {
            throw new NotFoundException(`No scheincriteria with the ID '${id}' could be found.`);
        }

        return criteria;
    }

    /**
     * Creates a new scheincriteria from the given DTO and returns the created one.
     *
     * @param dto DTO to create a criteria from.
     *
     * @returns The created scheincriteria
     *
     * @throws `NotFoundException` - If no scheincriteria could be generated with the provided identifier in the DTO.
     * @throws `BadRequestException` - If the provided data is not a valid criteria.
     */
    async create(dto: ScheinCriteriaDTO): Promise<IScheinCriteria> {
        const scheincriteria = Scheincriteria.fromDTO(dto);
        const entity = new ScheincriteriaEntity({
            name: dto.name,
            criteria: scheincriteria,
        });
        await this.em.persistAndFlush(entity);
        return entity.toDTO();
    }

    /**
     * Updates the scheincriteria with the given ID and returns the updated version.
     *
     * @param id ID of the scheincriteria to update.
     * @param dto Data to update the scheincriteria with.
     *
     * @returns Updated version of the scheincriteria.
     *
     * @throws `NotFoundException` - If there is no scheincriteria saved with the given ID or if no scheincriteria could be generated from the given DTO.
     * @throws `BadRequestException` - If the provided data is not a valid criteria.
     */
    async update(id: string, dto: ScheinCriteriaDTO): Promise<IScheinCriteria> {
        const scheincriteria = await this.findById(id);

        scheincriteria.criteria = Scheincriteria.fromDTO(dto);
        scheincriteria.name = dto.name;
        await this.em.persistAndFlush(scheincriteria);
        return scheincriteria.toDTO();
    }

    /**
     * Deletes the scheincriteria with the given ID if there is one.
     *
     * @param id ID of the scheincriteria to delete.
     *
     * @returns Deleted ScheincriteriaDocument.
     *
     * @throws `NotFoundException` - If no scheincriteria with the given ID could be found.
     */
    async delete(id: string): Promise<void> {
        const criteria = await this.findById(id);
        await this.em.removeAndFlush(criteria);
    }

    /**
     * Collects and returns the information about the criteria with the given ID. The result will be returned.
     *
     * @param criteriaId ID of the criteria to get the information for.
     *
     * @returns Information about the given criteria.
     *
     * @throws `NotFoundException` - If no criteria with the given ID could be found.
     */
    async getInfoAboutCriteria(criteriaId: string): Promise<CriteriaInformation> {
        const { criterias, studentInfos, ...handIns } = await this.getRequiredEntities({
            criteriaId,
        });

        const criteriaEntity = criterias[0];
        const criteria: Scheincriteria = Scheincriteria.fromDTO(criteriaEntity.toDTO());

        const [criteriaInfo, summaries] = await Promise.all([
            criteria.getInformation({ ...handIns, students: studentInfos.map((s) => s.student) }),
            this.calculateResultOfMultipleStudents({
                criterias,
                studentInfos,
                ...handIns,
            }),
        ]);

        const studentSummaries: SingleScheincriteriaSummaryByStudents = {};
        Object.entries(summaries).forEach(([key, summary]) => {
            studentSummaries[key] = summary.scheinCriteriaSummary[criteriaEntity.id];
        });

        return {
            name: criteriaEntity.name,
            studentSummaries,
            ...criteriaInfo,
        };
    }

    /**
     * Calculates the results of all criterias for the given student and returns the result.
     *
     * @param studentId Student ID to get the result for.
     *
     * @returns ScheinCriteriaSummary containing the result of the given student.
     *
     * @throws `NotFoundException` - If no student with the given ID could be found.
     */
    async getResultOfStudent(studentId: string): Promise<ScheincriteriaSummary> {
        const { studentInfos, ...params } = await this.getRequiredEntities({
            studentId,
        });

        return this.calculateResultOfSingleStudent({
            ...params,
            studentInfo: studentInfos[0],
        });
    }

    /**
     * Calculates the result of all criterias for all students and returns the result.
     *
     * @returns Results of all criterias for all students.
     */
    async getResultsOfAllStudents(): Promise<ScheincriteriaSummaryByStudents> {
        return this.calculateResultOfMultipleStudents(await this.getRequiredEntities());
    }

    /**
     * Calculates the results of all criterias for all students of the given tutorial. These results are then returned.
     *
     * @param tutorialId ID of the tutorial.
     *
     * @returns Criteria results of all students of the given tutorial.
     *
     * @throws `NotFoundException` - If no tutorial with the given ID could be found.
     */
    async getResultsOfTutorial(tutorialId: string): Promise<ScheincriteriaSummaryByStudents> {
        return this.calculateResultOfMultipleStudents(
            await this.getRequiredEntities({ tutorialId })
        );
    }

    /**
     * @returns The form data parsed from the loaded scheincriteria blueprints.
     */
    async getFormData(): Promise<FormDataResponse> {
        return ScheincriteriaContainer.getContainer().getFormData();
    }

    /**
     * Calculates the result of all given criterias for the given student and returns the result.
     *
     * @param params Must contain the student, the criterias, sheets and exams.
     *
     * @returns Calculation result of all given criterias for the given student.
     */
    private calculateResultOfSingleStudent(
        params: SingleStudentCalculationParams
    ): ScheincriteriaSummary {
        const summaries: ScheincriteriaSummary['scheinCriteriaSummary'] = {};
        let passed = true;

        for (const { id, name, criteria } of params.criterias) {
            const result = criteria.checkCriteriaStatus({
                student: params.studentInfo.student,
                gradingsOfStudent: params.studentInfo.gradingsOfStudent,
                sheets: params.sheets,
                exams: params.exams,
                shortTests: params.shortTests,
            });
            summaries[id] = { id, name, ...result };

            passed = passed && result.passed;
        }

        return {
            student: params.studentInfo.student.toDTO(),
            passed:
                passed || params.studentInfo.student.status === StudentStatus.NO_SCHEIN_REQUIRED,
            scheinCriteriaSummary: summaries,
        };
    }

    /**
     * Calculates the results of all given criterias for all given students.
     *
     * @param params Must contain a list of students, criterias, sheets and exams.
     *
     * @returns Criteria results for all given students of all given criterias.
     */
    private calculateResultOfMultipleStudents(
        params: MultipleStudentsCalculationParams
    ): ScheincriteriaSummaryByStudents {
        const { studentInfos, ...infos } = params;
        const summaries: ScheincriteriaSummaryByStudents = {};

        studentInfos.forEach((info) => {
            summaries[info.student.id] = this.calculateResultOfSingleStudent({
                ...infos,
                studentInfo: info,
            });
        });

        return summaries;
    }

    /**
     * Fetches all the required documents from the database.
     *
     * Some scenarios depend on the given `params`:
     * - `criteriaId` - If provided the `criterias` array will only contain the criteria with the ID. Otherwise the array will contain all criterias saved in the DB.
     * - `tutorialId` - If provided the `students` array will only contain those students from the tutorial with the given ID. Otherwise the description of `studentId` will apply. __Please note__: In case both `tutorialId` and `studentId` are provided `tutorialId` is taken and `studentId` is ignored.
     * - `studentId` - If provided the `students` array will only contain the student with the ID. Otherwise the array will contain all students saved in the DB (except `tutorialId` is provided).
     *
     * @param params Parameters which determine what gets actually fetched in certain scenarios (see above).
     *
     * @returns Object containing the documents according to the given `params`.
     * @throws `NotFoundException` - If any of the `params` is set and the corresponding document can not be found.
     *
     * @see ScheincriteriaService#getStudentEntities
     */
    private async getRequiredEntities(
        params: GetRequiredDocsParams = {}
    ): Promise<MultipleStudentsCalculationParams> {
        const { criteriaId, studentId, tutorialId } = params;
        const [criterias, studentInfos, sheets, exams, shortTests] = await Promise.all([
            criteriaId ? [await this.findById(criteriaId)] : this.findAll(),
            this.getStudentEntities({ studentId, tutorialId }),
            this.sheetService.findAll(),
            this.scheinexamService.findAll(),
            this.shortTestService.findAll(),
        ]);

        return { criterias, studentInfos, sheets, exams, shortTests };
    }

    /**
     * Fetches StudentDocuments from the DB according to the `params` object:
     *
     * - `tutorialId` - If provided the `students` array will only contain those students from the tutorial with the given ID. Otherwise the description of `studentId` will apply. __Please note__: In case both `tutorialId` and `studentId` are provided `tutorialId` is taken and `studentId` is ignored.
     * - `studentId` - If provided the `students` array will only contain the student with the ID. Otherwise the array will contain all students saved in the DB (except `tutorialId` is provided).
     *
     * @param params Params determining what documents are fetched (see above).
     *
     * @returns StudentDocuments according to the given params.
     * @throws `NotFoundException` - If any of the `params` is set and the corresponding document can not be found.
     */
    private async getStudentEntities(
        params: Pick<GetRequiredDocsParams, 'studentId' | 'tutorialId'>
    ): Promise<StudentAndGradings[]> {
        const { studentId, tutorialId } = params;
        let students: Student[];

        if (tutorialId) {
            students = await this.tutorialService.getAllStudentsOfTutorial(tutorialId);
        } else if (studentId) {
            students = [await this.studentService.findById(studentId)];
        } else {
            students = await this.studentService.findAll();
        }

        return this.gradingService.findAllGradingsOfMultipleStudents(students);
    }
}
