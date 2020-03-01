import { Injectable } from '@nestjs/common';
import { AttendancePDFGenerator } from './subservices/PDFGenerator.attendance';
import { CredentialsPDFGenerator } from './subservices/PDFGenerator.credentials';
import { ScheinResultsPDFGenerator } from './subservices/PDFGenerator.schein';
import { ScheinexamResultPDFGenerator } from './subservices/PDFGenerator.scheinexam';
import { DateTime } from 'luxon';

@Injectable()
export class PdfService {
  constructor(
    private readonly attendancePDF: AttendancePDFGenerator,
    private readonly credentialsPDF: CredentialsPDFGenerator,
    private readonly scheinResultsPDF: ScheinResultsPDFGenerator,
    private readonly scheinexamResultPDF: ScheinexamResultPDFGenerator
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
}
