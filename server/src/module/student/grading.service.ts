import { EntityManager } from '@mikro-orm/mysql';
import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { Grading } from '../../database/entities/grading.entity';
import { HandIn } from '../../database/entities/ratedEntity.entity';
import { Student } from '../../database/entities/student.entity';
import { ScheinexamService } from '../scheinexam/scheinexam.service';
import { SheetService } from '../sheet/sheet.service';
import { ShortTestService } from '../short-test/short-test.service';
import { GradingDTO } from './student.dto';
import { StudentService } from './student.service';

@Injectable()
export class GradingService {
    constructor(
        private readonly entityManager: EntityManager,
        @Inject(forwardRef(() => StudentService))
        private readonly studentService: StudentService,
        private readonly sheetService: SheetService,
        private readonly scheinexamService: ScheinexamService,
        private readonly shortTestService: ShortTestService
    ) {}

    /**
     * Sets the grading of the given student.
     *
     * If the DTO indicates an update the corresponding grading will be updated.
     *
     * @param student Student to set the grading for.
     * @param dto DTO which resembles the grading.
     */
    async setGradingOfStudent(student: Student, dto: GradingDTO): Promise<void> {
        const handIn: HandIn = await this.getHandInFromDTO(dto);
        const em = this.entityManager.fork(false);
        await em.begin();
        try {
            this.updateGradingOfStudent({ student: student, dto: dto, handIn: handIn, em: em });
            await em.commit();
        } catch (e) {
            await em.rollback();
            throw new BadRequestException(e);
        }
    }

    /**
     * Sets the grading of the given students to the one from the DTO.
     *
     * @param students Students to set the grading.
     * @param dto DTO which resembles the grading.
     */
    async setGradingOfMultipleStudents(students: Student[], dto: GradingDTO): Promise<void> {
        const handIn: HandIn = await this.getHandInFromDTO(dto);
        const em = this.entityManager.fork(false);
        await em.begin();

        try {
            for (const student of students) {
                this.updateGradingOfStudent({ student: student, dto: dto, handIn: handIn, em: em });
            }
            await em.commit();
        } catch (e) {
            await em.rollback();
            throw new BadRequestException(e);
        }
    }

    private updateGradingOfStudent({ student, dto, handIn, em }: UpdateGradingParams): void {
        const oldGrading: Grading | undefined = student.getGrading(handIn);
        const newGrading: Grading =
            !oldGrading || dto.createNewGrading ? new Grading({ handIn }) : oldGrading;

        newGrading.updateFromDTO({ dto, handIn });

        oldGrading?.students.remove(student);
        newGrading.students.add(student);

        if (oldGrading && oldGrading.students.length === 0) {
            em.remove(oldGrading);
        }

        em.persist(newGrading);
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
    em: EntityManager;
}
