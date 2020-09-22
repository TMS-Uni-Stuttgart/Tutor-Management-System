import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { HandInDocument } from '../../database/models/exercise.model';
import { GradingDocument, GradingModel } from '../../database/models/grading.model';
import { StudentDocument } from '../../database/models/student.model';
import { ScheinexamService } from '../scheinexam/scheinexam.service';
import { SheetService } from '../sheet/sheet.service';
import { ShortTestService } from '../short-test/short-test.service';
import { GradingDTO } from '../student/student.dto';
import { StudentService } from './student.service';

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
  async setGradingOfStudent(student: StudentDocument, dto: GradingDTO): Promise<void> {
    const handIn: HandInDocument = await this.getHandInFromDTO(dto);
    const oldGrading: GradingDocument | undefined = student.getGrading(handIn);
    let newGrading: GradingDocument;

    if (!oldGrading || dto.createNewGrading) {
      newGrading = GradingModel.fromDTO(dto);
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
  async setGradingOfMultipleStudents(students: StudentDocument[], dto: GradingDTO): Promise<void> {
    const handIn: HandInDocument = await this.getHandInFromDTO(dto);
    const gradingFromDTO = GradingModel.fromDTO(dto);

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
    handIn: HandInDocument,
    student: StudentDocument,
    grading: GradingDocument,
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
  async getHandInFromDTO(dto: GradingDTO): Promise<HandInDocument> {
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
      'You have to either set the sheetId nor the examId nor the shortTestId field.'
    );
  }

  /**
   * Fetches all students of the given grading from the DB.
   *
   * @param grading Grading to get students of.
   *
   * @returns StudentDocuments of all students attached to the given grading.
   */
  private async getStudentsOfGrading(grading: GradingDocument): Promise<StudentDocument[]> {
    return await this.studentService.findByCondition({
      _id: { $in: grading.getStudents() },
    });
  }
}
