import { Injectable, Logger } from '@nestjs/common';
import { ScheinexamDocument } from '../../../database/models/scheinexam.model';
import { StudentDocument } from '../../../database/models/student.model';
import { StudentStatus } from '../../../shared/model/Student';
import { PDFWithStudentsGenerator } from './PDFGenerator.withStudents';
import { StudentService } from '../../student/student.service';
import { ScheinexamService } from '../../scheinexam/scheinexam.service';

enum ExamPassedState {
  PASSED = 'PASSED',
  NOT_PASSED = 'NOT_PASSED',
  NOT_ATTENDED = 'NOT_ATTENDED',
}

interface PDFGeneratorOptions {
  id: string;
  enableShortMatriculationNo: boolean;
}

interface GetResultsParams {
  exam: ScheinexamDocument;
  students: StudentDocument[];
}

interface ExamResultsByStudents {
  [studentId: string]: ExamPassedState;
}

@Injectable()
export class ScheinexamResultPDFGenerator extends PDFWithStudentsGenerator<PDFGeneratorOptions> {
  constructor(
    private readonly studentService: StudentService,
    private readonly scheinexamService: ScheinexamService
  ) {
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
    id,
    enableShortMatriculationNo,
  }: PDFGeneratorOptions): Promise<Buffer> {
    const [exam, allStudents] = await Promise.all([
      this.scheinexamService.findById(id),
      this.studentService.findAll(),
    ]);
    const students = allStudents
      .filter(student => !!student.matriculationNo)
      .filter(student => student.status !== StudentStatus.INACTIVE);
    const shortenedMatriculationNumbers = this.getShortenedMatriculationNumbers(students);
    const results = this.getResultsOfAllStudents({ exam, students });

    const rows: string[] = [];
    shortenedMatriculationNumbers.forEach(({ studentId, shortenedNo }) => {
      const passedState: ExamPassedState = results[studentId] ?? ExamPassedState.NOT_ATTENDED;
      if (enableShortMatriculationNo) {
        rows.push(`<tr><td>${shortenedNo}</td><td>{{${passedState}}}</td></tr>`);
      } else {
        const student = students.find(s => s.id === studentId);
        rows.push(
          `<tr><td>${student?.matriculationNo} (${shortenedNo})</td><td>{{${passedState}}}</td></tr>`
        );
      }
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
  private getResultsOfAllStudents({ exam, students }: GetResultsParams): ExamResultsByStudents {
    const results: ExamResultsByStudents = {};

    students.forEach(student => {
      const examGrading = student.getGrading(exam);
      const hasAttended = examGrading !== undefined;

      if (hasAttended) {
        results[student.id] = exam.hasPassed(student).passed
          ? ExamPassedState.PASSED
          : ExamPassedState.NOT_PASSED;
      } else {
        results[student.id] = ExamPassedState.NOT_ATTENDED;
      }
    });

    return results;
  }
}
