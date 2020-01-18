import { PDFModule } from './PDFModule';
import { StudentDocument } from '../../../model/documents/StudentDocument';

interface ShortenedMatriculationNumbers {
  [studentId: string]: string;
}

export abstract class PDFWithStudentsModule<T> extends PDFModule<T> {
  /**
   * Returns the shortened number for all students as a "Map" in the form `studentId` -> `short matriculation no.`.
   *
   * Those shortened numbers are still enough to identify a student. However, this is only true if one only consideres the given students. If one extends that array without re-running this function the identifying feature may get lost.
   *
   * @param students All students to get the shortened number from.
   *
   * @returns The shortened but still identifying matriculation numbers of all given students.
   */
  protected getShortenedMatriculationNumbers(
    students: StudentDocument[]
  ): ShortenedMatriculationNumbers {
    const result: ShortenedMatriculationNumbers = {};

    for (const student of students) {
      result[student.id] = this.shortOneMatriculationNumber(student, students);
    }

    return result;
  }

  /**
   * Generates a matriculation number with the form "***123" where the first digits get replaced with "*". All students in the `students` array get a unique matriculation number. Therefore these "shortened" numbers are still enough to identify a student.
   *
   * @param student Student to generate the short matriculation number for.
   * @param students All students to consider.
   *
   * @returns The shortened but still identifying number of the given student.
   */
  private shortOneMatriculationNumber(
    student: StudentDocument,
    students: StudentDocument[]
  ): string {
    if (!student.matriculationNo) {
      throw new Error(`Student ${student.id} does not have a matriculation number.`);
    }

    const otherStudents = students.filter(s => s.id !== student.id);
    const lengthOfNo = student.matriculationNo.length;

    for (let iteration = 1; iteration < lengthOfNo; iteration++) {
      const shortStudent = student.matriculationNo.substr(lengthOfNo - iteration, iteration);
      let isOkay = true;

      for (const otherStudent of otherStudents) {
        if (!otherStudent.matriculationNo) {
          continue;
        }

        const shortOtherStudent = otherStudent.matriculationNo.substr(
          lengthOfNo - iteration,
          iteration
        );

        if (shortStudent === shortOtherStudent) {
          isOkay = false;
          break;
        }
      }

      if (isOkay) {
        return shortStudent.padStart(7, '*');
      }
    }

    return student.matriculationNo;
  }
}
