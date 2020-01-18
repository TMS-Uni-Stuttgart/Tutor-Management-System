import { ScheinexamDocument } from '../../../model/documents/ScheinexamDocument';
import { StudentDocument } from '../../../model/documents/StudentDocument';
import { PDFWithStudentsModule } from './PDFWithStudentsModule';
import { PointMap } from 'shared/src/model/Points';
import { StudentStatus } from 'shared/src/model/Student';
import Logger from '../../../helpers/Logger';

enum ExamPassedState {
  PASSED = 'PASSED',
  NOT_PASSED = 'NOT_PASSED',
  NOT_ATTENDED = 'NOT_ATTENDED',
}

interface PDFGeneratorOptions {
  exam: ScheinexamDocument;
  students: StudentDocument[];
}

interface ExamResultsByStudents {
  [studentId: string]: ExamPassedState;
}

export class ScheinexamResultPDFModule extends PDFWithStudentsModule<PDFGeneratorOptions> {
  constructor() {
    super('scheinexam.html');
  }

  /**
   * Generates a PDF from the given students with their results of the given Scheinexam. Students which are INACTIVE are getting ignored aswell as students which don't have a matriculation number (due to not being able to put those students in the PDF in an "anonymous" way).
   *
   * @param options Must contain a ScheinexamDocument and an array of StudentDocument.
   *
   * @returns Buffer containing a PDF which itself contains the results of the given students of the given exam.
   */
  public async generatePDF({
    exam,
    students: givenStudents,
  }: PDFGeneratorOptions): Promise<Buffer> {
    const students = givenStudents
      .filter(student => !!student.matriculationNo)
      .filter(student => student.status !== StudentStatus.INACTIVE);
    const shortenedMatriculationNumbers = this.getShortenedMatriculationNumbers(students);
    const results = this.getResultsOfAllStudents({ exam, students });

    const rows: string[] = [];
    Object.entries(shortenedMatriculationNumbers)
      .sort(([, matrA], [, matrB]) => matrA.localeCompare(matrB))
      .forEach(([id, shortenedMatrNo]) => {
        const passedState: ExamPassedState = results[id] ?? ExamPassedState.NOT_ATTENDED;
        rows.push(`<tr><td>${shortenedMatrNo}</td><td>{{${passedState}}}</td></tr>`);
      });

    const body = this.replacePlaceholdersInTemplate(rows, exam);

    return this.generatePDFFromBody(body);
  }

  /**
   * Replaces the placeholdes `{{statuses}}` and `{{scheinExamNo}}` in the template by their actual values. The adjusted template gets returned.
   *
   * @param tableRows Rows to add to the template instead of `{{statuses}}`
   * @param exam Exam to get the `{{scheinExamNo}}` of.
   *
   * @returns String containing the template but with the actual information.
   */
  private replacePlaceholdersInTemplate(tableRows: string[], exam: ScheinexamDocument): string {
    const template = this.getTemplate();

    return template
      .replace(/{{scheinExamNo}}/g, exam.scheinExamNo.toString())
      .replace(/{{statuses(?:,\s*(.*))?}}/g, (_, option) => {
        let replacements = {
          passed: 'Passed',
          notPassed: 'Not passed',
          notAttended: 'Not attended',
        };

        try {
          replacements = { ...replacements, ...JSON.parse(option) };
        } catch (err) {
          Logger.warn(
            `Could not parse option argument in schein exam html template. Falling back to defaults instead.`
          );
          Logger.warn(`\tProvided option: ${option}`);
        }

        return tableRows
          .join('')
          .replace(new RegExp(`{{${ExamPassedState.PASSED}}}`, 'g'), replacements.passed)
          .replace(new RegExp(`{{${ExamPassedState.NOT_PASSED}}}`, 'g'), replacements.notPassed)
          .replace(
            new RegExp(`{{${ExamPassedState.NOT_ATTENDED}}}`, 'g'),
            replacements.notAttended
          );
      });
  }

  /**
   * Returns the results of all given students for the given exam. Those results are mapped with the student's id as a key and the result as value.
   *
   * @param Options Options containing the exam and all students to get the results from.
   *
   * @returns The results of all students mapped by their ID.
   */
  private getResultsOfAllStudents({ exam, students }: PDFGeneratorOptions): ExamResultsByStudents {
    const results: ExamResultsByStudents = {};

    students.forEach(student => {
      const examResults = new PointMap(student.scheinExamResults);
      const hasAttended = examResults.has(exam.id);

      if (hasAttended) {
        results[student.id] = exam.hasPassed(student)
          ? ExamPassedState.PASSED
          : ExamPassedState.NOT_PASSED;
      } else {
        results[student.id] = ExamPassedState.NOT_ATTENDED;
      }
    });

    return results;
  }
}
