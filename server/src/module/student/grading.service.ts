import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { Grading } from '../../database/entities/grading.entity';
import { HandIn } from '../../database/entities/ratedEntity.entity';
import { Student } from '../../database/entities/student.entity';
import { ScheinexamService } from '../scheinexam/scheinexam.service';
import { SheetService } from '../sheet/sheet.service';
import { ShortTestService } from '../short-test/short-test.service';
import { GradingDTO } from './student.dto';
import { StudentService } from './student.service';

// TODO: Rewrite me because with SQL this should be way less code...
@Injectable()
export class GradingService {
    constructor(
        @Inject(forwardRef(() => StudentService))
        private readonly studentService: StudentService,
        private readonly sheetService: SheetService,
        private readonly scheinexamService: ScheinexamService,
        private readonly shortTestService: ShortTestService
    ) {}

    /**
     * Sets the grading of the given student.
     *
     * If the DTO indicates an update the corresponding grading will be updated. All related GradingDocument in other students get updated aswell. For more information see {@link GradingService#assignGradingToStudent}.
     *
     * @param student Student to set the grading for.
     * @param dto DTO which resembles the grading.
     */
    async setGradingOfStudent(student: Student, dto: GradingDTO): Promise<void> {
        const handIn: HandIn = await this.getHandInFromDTO(dto);
        const oldGrading: Grading | undefined = student.getGrading(handIn);
        let newGrading: Grading;

        if (!oldGrading || dto.createNewGrading) {
            newGrading = Grading.fromDTO(dto);
        } else {
            oldGrading.updateFromDTO(dto);
            newGrading = oldGrading;
        }

        await this.assignGradingToStudent(handIn, student, newGrading, dto.createNewGrading);
    }

    /**
     * Sets the grading of the given students to the one from the DTO.
     *
     * @param students Students to set the grading.
     * @param dto DTO which resembles the grading.
     */
    async setGradingOfMultipleStudents(students: Student[], dto: GradingDTO): Promise<void> {
        const handIn: HandIn = await this.getHandInFromDTO(dto);
        const gradingFromDTO = Grading.fromDTO(dto);

        for (const student of students) {
            gradingFromDTO.addStudent(student);
        }

        for (const student of students) {
            // TODO: Add special cases.
            student.setGrading(handIn, gradingFromDTO);
        }

        await Promise.all(students.map((s) => s.save()));
    }

    private async assignGradingToStudent(
        handIn: HandIn,
        student: Student,
        grading: Grading,
        createNewGrading: boolean
    ): Promise<void> {
        const oldGrading = student.getGrading(handIn);

        if (oldGrading) {
            oldGrading.removeStudent(student);
            const otherStudents = await this.getStudentsOfGrading(oldGrading);

            if (createNewGrading) {
                for (const otherStudent of otherStudents) {
                    const gradingOfOtherStudent = otherStudent.getGrading(handIn);

                    if (gradingOfOtherStudent) {
                        gradingOfOtherStudent.removeStudent(student);
                        otherStudent.setGrading(handIn, gradingOfOtherStudent);
                        await otherStudent.save();
                    }
                }
            } else {
                for (const otherStudent of otherStudents) {
                    otherStudent.setGrading(handIn, grading);
                    await otherStudent.save();
                }
            }
        }

        student.setGrading(handIn, grading);
        await student.save();
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
