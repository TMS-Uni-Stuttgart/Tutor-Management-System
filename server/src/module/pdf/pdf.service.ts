import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import JSZip from 'jszip';
import { AttendancePDFGenerator } from './subservices/PDFGenerator.attendance';
import { CredentialsPDFGenerator } from './subservices/PDFGenerator.credentials';
import { MarkdownPDFGenerator } from './subservices/PDFGenerator.markdown';
import { ScheinResultsPDFGenerator } from './subservices/PDFGenerator.schein';
import { ScheinexamResultPDFGenerator } from './subservices/PDFGenerator.scheinexam';
import {
  MarkdownService,
  GenerateTeamGradingParams,
  GenerateAllTeamsGradingParams,
} from '../markdown/markdown.service';

@Injectable()
export class PdfService {
  constructor(
    private readonly attendancePDF: AttendancePDFGenerator,
    private readonly credentialsPDF: CredentialsPDFGenerator,
    private readonly scheinResultsPDF: ScheinResultsPDFGenerator,
    private readonly scheinexamResultPDF: ScheinexamResultPDFGenerator,
    private readonly markdownPDF: MarkdownPDFGenerator,
    private readonly markdownService: MarkdownService
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

  /**
   * Generates a PDF from the grading of the given team for the given sheet.
   *
   * @param params Options passed to the markdown generation function.
   *
   * @returns Buffer containing the generated PDF.
   *
   * @throws `NotFoundException` - If either no team with the given ID or no sheet with the given ID could be found.
   * @throws `BadRequestException` - If the given team does not have any students or the students do not hold a grading for the given sheet.
   */
  async generateGradingPDF(params: GenerateTeamGradingParams): Promise<Buffer> {
    const markdown = await this.markdownService.getTeamGrading(params);

    return this.markdownPDF.generatePDF({ markdown });
  }

  /**
   * Generates a ZIP containing a PDF per team of the given tutorial with it's grading for the given sheet.
   *
   * @param params Options passed to the markdown generation function.
   *
   * @returns ReadableStream containing the ZIP-file containing the PDFs of the gradings.
   *
   * @throws `NotFoundException` - If either no tutorial with the given ID or no sheet with the given ID could be found.
   */
  async generateTutorialGradingZIP(
    params: GenerateAllTeamsGradingParams
  ): Promise<NodeJS.ReadableStream> {
    const { markdownForGradings, sheetNo } = await this.markdownService.getAllTeamsGradings(params);
    const files: { filename: string; payload: Buffer }[] = [];

    for (const gradingMD of markdownForGradings) {
      files.push({
        filename: `Ex${sheetNo}_${gradingMD.teamName}.pdf`, // TODO: Make template.
        payload: await this.markdownPDF.generatePDF({ markdown: gradingMD.markdown }),
      });
    }

    const zip = new JSZip();

    files.forEach(({ filename, payload }) => {
      zip.file(filename, payload, { binary: true });
    });

    return zip.generateNodeStream({ type: 'nodebuffer' });
  }
}
