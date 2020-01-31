import { StudentDocument } from '../../../model/documents/StudentDocument';
import { PDFModule } from './PDFModule';

interface ShortendMatriculationInfo {
  studentId: string;
  shortenedNo: string;
}

export abstract class PDFWithStudentsModule<T> extends PDFModule<T> {
  /**
   * Returns the shortened number for all students together with the ID of the student to which the shortened matriculation number belongs to.
   *
   * Those shortened numbers are still enough to identify a student. However, this is only true if one only consideres the given students. If one extends that array without re-running this function the identifying feature may get lost.
   *
   * @param students All students to get the shortened number from.
   *
   * @returns The shortened but still identifying matriculation numbers of all given students.
   */
  protected getShortenedMatriculationNumbers(
    students: StudentDocument[]
  ): ShortendMatriculationInfo[] {
    const result: ShortendMatriculationInfo[] = [];
    const matriculationNos: { id: string; reversedNumber: string }[] = [];

    for (const student of students) {
      if (student.matriculationNo) {
        matriculationNos.push({
          id: student.id,
          reversedNumber: this.reverseString(student.matriculationNo),
        });
      }
    }

    matriculationNos.sort((a, b) => a.reversedNumber.localeCompare(b.reversedNumber));

    matriculationNos.forEach((current, idx) => {
      let position: number;

      if (idx === matriculationNos.length) {
        const prev = matriculationNos[idx - 1];
        position = this.getFirstDifferentPosition(current.reversedNumber, prev.reversedNumber);
      } else {
        const next = matriculationNos[idx + 1];
        position = this.getFirstDifferentPosition(current.reversedNumber, next.reversedNumber);
      }

      const substring = this.reverseString(current.reversedNumber.substr(0, position + 1));
      result.push({
        studentId: current.id,
        shortenedNo: substring.padStart(7, '*'),
      });
    });

    return result.sort((a, b) => a.shortenedNo.localeCompare(b.shortenedNo));
  }

  /**
   * Searches for the position of the first character which both strings __DO NOT__ have in common. This position is then returned.
   *
   * @param first First string
   * @param second Second string
   * @returns The first position in which both string differ. If they are completly equal the length of the first string is returned.
   */
  private getFirstDifferentPosition(first: string, second: string): number {
    for (let i = 0; i < first.length; i++) {
      if (first.charAt(i) !== second.charAt(i)) {
        return i;
      }
    }

    return first.length;
  }

  /**
   * @param string String to reverse
   * @returns The reversed string.
   */
  private reverseString(string: string): string {
    return string
      .split('')
      .reverse()
      .join('');
  }

  /**
   * @deprecated // TODO: REMOVE ME
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
