import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { AttendancePDFGenerator } from './subservices/PDFGenerator.attendance';
import { CredentialsPDFGenerator } from './subservices/PDFGenerator.credentials';
import { MarkdownPDFGenerator } from './subservices/PDFGenerator.markdown';
import { ScheinResultsPDFGenerator } from './subservices/PDFGenerator.schein';
import { ScheinexamResultPDFGenerator } from './subservices/PDFGenerator.scheinexam';

@Injectable()
export class PdfService {
  constructor(
    private readonly attendancePDF: AttendancePDFGenerator,
    private readonly credentialsPDF: CredentialsPDFGenerator,
    private readonly scheinResultsPDF: ScheinResultsPDFGenerator,
    private readonly scheinexamResultPDF: ScheinexamResultPDFGenerator,
    private readonly markdownPDF: MarkdownPDFGenerator
  ) {}

  /**
   * Generates a list for signing the attendances of the tutorial at the given date.
   *
   * @param tutorialId ID of the tutorial to generate the PDF for.
   * @param date Date to generate the PDF for.
   *
   * @returns Buffer containing the generated PDF.
   *
   * @throws `NotFoundException` - If no tutorial with the given ID could be found.
   */
  async generateAttendancePDF(tutorialId: string, date: string): Promise<Buffer> {
    return this.attendancePDF.generatePDF({ tutorialId, date: DateTime.fromISO(date) });
  }

  /**
   * Generates a list with the credentials for all users.
   *
   * The list only contains the password for users which have not yet changed their password (ie they still have a `temporaryPassword`).
   *
   * @returns Buffer containing the generated PDF.
   */
  async generateCredentialsPDF(): Promise<Buffer> {
    return this.credentialsPDF.generatePDF();
  }

  /**
   * Generates a list with the schein results for all students with matriculation numbers.
   *
   * The list either has shortened matriculation numbers or not, depending on the corresponding parameter.
   *
   * @param enableShortMatriculationNo Flag to determine if the matriculation numbers should be shortened or not.
   *
   * @returns Buffer containing the generated PDF.
   */
  async generateStudentScheinOverviewPDF(enableShortMatriculationNo: boolean): Promise<Buffer> {
    return this.scheinResultsPDF.generatePDF({ enableShortMatriculationNo });
  }

  /**
   * Generates a list with the scheinexam results for the given scheinexam for all students with matriculation numbers.
   *
   * The list either has shortened matriculation numbers or not, depending on the corresponding parameter.
   *
   * @param id ID of the scheinexam to get the list for.
   * @param enableShortMatriculationNo Flag to determine if the matriculation numbers should be shortened or not.
   *
   * @returns Buffer containing the generated PDF.
   */
  async generateScheinexamResultPDF(
    id: string,
    enableShortMatriculationNo: boolean
  ): Promise<Buffer> {
    return this.scheinexamResultPDF.generatePDF({ id, enableShortMatriculationNo });
  }
}
