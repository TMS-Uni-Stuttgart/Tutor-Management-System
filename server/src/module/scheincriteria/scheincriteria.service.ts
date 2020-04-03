import { Injectable, NotFoundException } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import {
  ScheincriteriaDocument,
  ScheincriteriaModel,
} from '../../database/models/scheincriteria.model';
import { CRUDService } from '../../helpers/CRUDService';
import { FormDataResponse } from '../../shared/model/FormTypes';
import {
  IScheinCriteria,
  ScheinCriteriaSummary as ScheincriteriaSummary,
  ScheincriteriaSummaryByStudents,
  CriteriaInformation,
  SingleScheincriteriaSummaryByStudents,
} from '../../shared/model/ScheinCriteria';
import { Scheincriteria } from './container/Scheincriteria';
import { ScheincriteriaContainer } from './container/scheincriteria.container';
import { ScheinCriteriaDTO } from './scheincriteria.dto';
import { StudentService } from '../student/student.service';
import { SheetService } from '../sheet/sheet.service';
import { ScheinexamService } from '../scheinexam/scheinexam.service';
import { StudentDocument } from '../../database/models/student.model';
import { ScheinexamDocument } from '../../database/models/scheinexam.model';
import { SheetDocument } from '../../database/models/sheet.model';
import { TutorialService } from '../tutorial/tutorial.service';

interface SingleCalculationParams {
  student: StudentDocument;
  criterias: ScheincriteriaDocument[];
  exams: ScheinexamDocument[];
  sheets: SheetDocument[];
}

interface MultipleCalculationParams {
  students: StudentDocument[];
  criterias: ScheincriteriaDocument[];
  exams: ScheinexamDocument[];
  sheets: SheetDocument[];
}

@Injectable()
export class ScheincriteriaService
  implements CRUDService<IScheinCriteria, ScheinCriteriaDTO, ScheincriteriaDocument> {
  constructor(
    private readonly studentService: StudentService,
    private readonly sheetService: SheetService,
    private readonly scheinexamService: ScheinexamService,
    private readonly tutorialService: TutorialService,
    @InjectModel(ScheincriteriaModel)
    private readonly scheincriteriaModel: ReturnModelType<typeof ScheincriteriaModel>
  ) {}

  /**
   * @returns All scheincriterias saved in the database.
   */
  async findAll(): Promise<ScheincriteriaDocument[]> {
    const criterias = await this.scheincriteriaModel.find().exec();

    return criterias;
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
  async findById(id: string): Promise<ScheincriteriaDocument> {
    const criteria = await this.scheincriteriaModel.findById(id).exec();

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
    const document = {
      name: dto.name,
      criteria: scheincriteria,
    };

    const createdCriteria = await this.scheincriteriaModel.create(document);

    return createdCriteria.toDTO();
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

    const updatedCriteria = await scheincriteria.save();

    return updatedCriteria.toDTO();
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
  async delete(id: string): Promise<ScheincriteriaDocument> {
    const criteria = await this.findById(id);

    return criteria.remove();
  }

  /**
   * Collects and returns the information about the criteria with the given ID. The result will be returned.
   *
   * @param id ID of the criteria to get the information for.
   *
   * @returns Information about the given criteria.
   *
   * @throws `NotFoundException` - If no criteria with the given ID could be found.
   */
  async getInfoAboutCriteria(id: string): Promise<CriteriaInformation> {
    const [criteriaDoc, students, sheets, exams] = await Promise.all([
      this.findById(id),
      this.studentService.findAll(),
      this.sheetService.findAll(),
      this.scheinexamService.findAll(),
    ]);

    const criteria: Scheincriteria = Scheincriteria.fromDTO(criteriaDoc.toDTO());

    const [criteriaInfo, summaries] = await Promise.all([
      criteria.getInformation({ exams, sheets, students }),
      this.calculateResultOfMultipleStudents({
        criterias: [criteriaDoc],
        students,
        sheets,
        exams,
      }),
    ]);

    const studentSummaries: SingleScheincriteriaSummaryByStudents = {};
    Object.entries(summaries).forEach(([key, summary]) => {
      studentSummaries[key] = summary.scheinCriteriaSummary[criteriaDoc.id];
    });

    return {
      name: criteriaDoc.name,
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
    const [criterias, student, sheets, exams] = await Promise.all([
      this.findAll(),
      this.studentService.findById(studentId),
      this.sheetService.findAll(),
      this.scheinexamService.findAll(),
    ]);

    return this.calculateResultOfSingleStudent({ criterias, student, sheets, exams });
  }

  /**
   * Calculates the result of all criterias for all students and returns the result.
   *
   * @returns Results of all criterias for all students.
   */
  async getResultsOfAllStudents(): Promise<ScheincriteriaSummaryByStudents> {
    const [criterias, students, sheets, exams] = await Promise.all([
      this.findAll(),
      this.studentService.findAll(),
      this.sheetService.findAll(),
      this.scheinexamService.findAll(),
    ]);

    return this.calculateResultOfMultipleStudents({ students, criterias, sheets, exams });
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
    const [criterias, students, sheets, exams] = await Promise.all([
      this.findAll(),
      this.tutorialService.getAllStudentsOfTutorial(tutorialId),
      this.sheetService.findAll(),
      this.scheinexamService.findAll(),
    ]);

    return this.calculateResultOfMultipleStudents({ students, criterias, sheets, exams });
  }

  /**
   * Calculates the result of all given criterias for the given student and returns the result.
   *
   * @param params Must contain the student, the criterias, sheets and exams.
   *
   * @returns Calculation result of all given criterias for the given student.
   */
  private calculateResultOfSingleStudent({
    criterias,
    student,
    exams,
    sheets,
  }: SingleCalculationParams): ScheincriteriaSummary {
    const summaries: ScheincriteriaSummary['scheinCriteriaSummary'] = {};
    let passed = true;

    for (const { id, name, criteria } of criterias) {
      const result = criteria.checkCriteriaStatus({ student, exams, sheets });
      summaries[id] = { id, name, ...result };

      passed = passed && result.passed;
    }

    return {
      passed,
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
  private calculateResultOfMultipleStudents({
    criterias,
    students,
    exams,
    sheets,
  }: MultipleCalculationParams): ScheincriteriaSummaryByStudents {
    const summaries: ScheincriteriaSummaryByStudents = {};

    students.forEach((student) => {
      const result = this.calculateResultOfSingleStudent({ criterias, student, sheets, exams });

      summaries[student.id] = result;
    });

    return summaries;
  }

  /**
   * @returns The form data parsed from the loaded scheincriteria blueprints.
   */
  async getFormData(): Promise<FormDataResponse> {
    return ScheincriteriaContainer.getContainer().getFormData();
  }
}
