import { EntityRepository } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { GradingResponseData } from 'shared/model/Gradings';
import { Grading } from '../../database/entities/grading.entity';
import { HandIn } from '../../database/entities/ratedEntity.entity';
import { Student } from '../../database/entities/student.entity';
import { Team } from '../../database/entities/team.entity';
import { GradingList, GradingListsForStudents } from '../../helpers/GradingList';
import { ScheinexamService } from '../scheinexam/scheinexam.service';
import { SheetService } from '../sheet/sheet.service';
import { ShortTestService } from '../short-test/short-test.service';
import { GradingDTO } from './student.dto';
import { StudentService } from './student.service';

@Injectable()
export class GradingService {
    constructor(
        @Inject(forwardRef(() => StudentService))
        private readonly studentService: StudentService,
        private readonly sheetService: SheetService,
        private readonly scheinexamService: ScheinexamService,
        private readonly shortTestService: ShortTestService,
        private readonly entityManager: EntityManager,
        @InjectRepository(Grading)
        private readonly repository: EntityRepository<Grading>,
        @Inject(EntityManager)
        private readonly em: EntityManager
    ) {}

    /**
     * @param handInId ID of the hand-in to find the gradings for.
     *
     * @returns All gradings which belong to the hand-in with the given handInId.
     */
    async findOfHandIn(handInId: string): Promise<GradingResponseData[]> {
        const gradings = await this.repository.find({ handInId: handInId }, { populate: ['*'] });
        const data: GradingResponseData[] = [];

        gradings.forEach((grading) => {
            grading.students.getItems().forEach((student) => {
                data.push({ studentId: student.id, gradingData: grading.toDTO() });
            });
        });

        return data;
    }

    /**
     * @param studentId ID of the student to get the gradings for.
     *
     * @returns All gradings that this student has.
     */
    async findOfStudent(studentId: string): Promise<GradingList> {
        const gradings = await this.repository.find({ students: studentId }, { populate: ['*'] });
        return new GradingList(gradings);
    }

    /**
     * @param studentId ID of the student to get the grading for.
     * @param handInId ID of the hand-in to get the grading of.
     *
     * @returns Grading which matches the parameters. If there is no such grading `undefined` is returned instead.
     */
    async findOfStudentAndHandIn(
        studentId: string,
        handInId: string
    ): Promise<Grading | undefined> {
        const grading = await this.repository.findOne(
            { students: studentId, handInId: handInId },
            { populate: ['*'] }
        );

        return grading ?? undefined;
    }

    /**
     * @param studentIds IDs of all students to get the gradings for.
     *
     * @returns The gradings of the students with the given IDs.
     */
    async findOfMultipleStudents(studentIds: string[]): Promise<GradingListsForStudents> {
        // const gradings = await this.gradingRepository.find({
        //     students: { $contains: studentIds },
        // });
        // TODO: Can one use the "groupBy" option here instead of the code below to improve performance?
        const gradingLists = new GradingListsForStudents();
        for (const studentId of studentIds) {
            gradingLists.addGradingList(studentId, await this.findOfStudent(studentId));
        }
        return gradingLists;
    }

    /**
     * @param tutorialId ID of the tutorial to get the gradings for.
     * @param handInId ID of the hand-in to get the grading for.
     *
     * @returns The gradings of the students with the given IDs.
     */
    async findOfTutorialAndHandIn(
        tutorialId: string,
        handInId: string
    ): Promise<GradingResponseData[]> {
        const students = await this.studentService.findOfTutorial(tutorialId);
        const gradings = students.map<Promise<GradingResponseData>>(async (s) => {
            return {
                studentId: s.id,
                gradingData: (await this.findOfStudentAndHandIn(s.id, handInId))?.toDTO(),
            };
        });

        return await Promise.all(gradings);
    }

    /**
     * Sets the grading of the given student.
     *
     * If the DTO indicates an update the corresponding grading will be updated.
     *
     * @param student Student to set the grading for.
     * @param dto DTO which resembles the grading.
     *
     * @see setOfMultipleStudents
     */
    async setOfStudent(student: Student, dto: GradingDTO): Promise<void> {
        return this.setOfMultipleStudents(new Map([[student, dto]]));
    }

    /**
     * Sets the grading of the given students to the one from the DTO.
     *
     * @param dtos Maps each student to the DTO of the grading which belongs to it.
     *
     * @throws `BadRequestException` - If an error occurs during the setting process of _any_ student this exception is thrown.
     */
    async setOfMultipleStudents(dtos: Map<Student, GradingDTO>): Promise<void> {
        for (const [student, dto] of dtos) {
            const handIn = await this.getHandInFromDTO(dto);
            await this.updateGradingOfStudent({ student, dto, handIn });
        }
        await this.entityManager.flush();
    }

    /**
     * Sets the grading of all students of the given team to the one from the DTO.
     *
     * @param team Team which students should get the new grading.
     * @param dto DTO of the new grading.
     *
     * @throws `BadRequestException` - If the students of the team have different gradings.
     */
    async setOfTeam(team: Team, dto: GradingDTO): Promise<void> {
        const handIn = await this.getHandInFromDTO(dto);
        const students = team.getStudents();
        if (students.length > 0) {
            const oldGradings = await Promise.all(
                students.map((student) => this.findOfStudentAndHandIn(student.id, handIn.id))
            );
            const oldGradingIds = new Set(
                oldGradings.map((grading) => grading?.id).filter((gradingId) => gradingId)
            );
            if (oldGradingIds.size > 1) {
                throw new BadRequestException('Students have different gradings.');
            }
            const oldGrading = oldGradings[0];
            const newGrading =
                !oldGrading || dto.createNewGrading ? new Grading({ handIn }) : oldGrading;

            newGrading.updateFromDTO({ dto, handIn });
            oldGrading?.students.remove(students);
            newGrading.students.add(students);

            if (!!oldGrading && oldGrading.students.length === 0) {
                this.em.remove(oldGrading);
            }

            await this.em.persistAndFlush(newGrading);
        }
    }

    async findAllGradingsOfStudent(student: Student): Promise<Grading[]> {
        return this.repository.find({ students: student.id }, { populate: ['*'] });
    }

    async findAllGradingsOfMultipleStudents(students: Student[]): Promise<StudentAndGradings[]> {
        const gradingsOfStudents: StudentAndGradings[] = [];
        for (const student of students) {
            const gradings = await this.findAllGradingsOfStudent(student);
            gradingsOfStudents.push({
                student,
                gradingsOfStudent: new GradingList(gradings),
            });
        }
        return gradingsOfStudents;
    }

    async findAllHandInGradingsOfTeam(team: Team, handIn: HandIn): Promise<Grading[]> {
        const gradings = await Promise.all(
            team.getStudents().map((s) =>
                this.repository.find(
                    {
                        handInId: handIn.id,
                        students: s,
                    },
                    { populate: ['*'] }
                )
            )
        );
        return [...new Set(gradings.flat())];
    }

    private async updateGradingOfStudent({
        student,
        dto,
        handIn,
    }: UpdateGradingParams): Promise<void> {
        const oldGrading: Grading | undefined = await this.findOfStudentAndHandIn(
            student.id,
            handIn.id
        );
        const newGrading: Grading =
            !oldGrading || dto.createNewGrading ? new Grading({ handIn }) : oldGrading;

        newGrading.updateFromDTO({ dto, handIn });

        oldGrading?.students.remove(student);
        newGrading.students.add(student);

        if (!!oldGrading && oldGrading.students.length === 0) {
            this.em.remove(oldGrading);
        }

        this.em.persist(newGrading);
    }

    /**
     * Returns either a ScheinexamDocument or an ScheinexamDocument associated to the given DTO.
     *
     * If all fields, `sheetId`, `examId` and `shortTestId`, are set, an exception is thrown. An exception is also thrown if none of the both fields is set.
     *
     * @param dto DTO to return the associated document with exercises for.
     *
     * @returns Associated document with exercises.
     *
     * @throws `BadRequestException` - If either all fields (`sheetId`, `examId` and `shortTestId`) or none of those fields are set.
     */
    async getHandInFromDTO(dto: GradingDTO): Promise<HandIn> {
        const { sheetId, examId, shortTestId } = dto;

        if (!!sheetId && !!examId && !!shortTestId) {
            throw new BadRequestException(
                'You have to set exactly one of the three fields sheetId, examId and shortTestId - not all three.'
            );
        }

        if (!!sheetId) {
            return this.sheetService.findById(sheetId);
        }

        if (!!examId) {
            return this.scheinexamService.findById(examId);
        }

        if (!!shortTestId) {
            return this.shortTestService.findById(shortTestId);
        }

        throw new BadRequestException(
            'You have to either set the sheetId or the examId or the shortTestId field.'
        );
    }
}

interface UpdateGradingParams {
    student: Student;
    dto: GradingDTO;
    handIn: HandIn;
}

export interface StudentAndGradings {
    student: Student;
    gradingsOfStudent: GradingList;
}
