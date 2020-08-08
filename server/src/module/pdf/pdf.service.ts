import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import JSZip from 'jszip';
import { DateTime } from 'luxon';
import pug from 'pug';
import { SheetDocument } from '../../database/models/sheet.model';
import {
  GenerateAllTeamsGradingParams,
  GenerateTeamGradingParams,
  MarkdownService,
} from '../markdown/markdown.service';
import { SettingsService } from '../settings/settings.service';
import { SheetService } from '../sheet/sheet.service';
import { Template } from '../template/template.types';
import { AttendancePDFGenerator } from './subservices/PDFGenerator.attendance';
import { CredentialsPDFGenerator } from './subservices/PDFGenerator.credentials';
import { MarkdownPDFGenerator } from './subservices/PDFGenerator.markdown';
import { ScheinResultsPDFGenerator } from './subservices/PDFGenerator.schein';
import { ScheinexamResultPDFGenerator } from './subservices/PDFGenerator.scheinexam';

interface ZipData {
  filename: string;
  payload: Buffer;
}

interface FileNameParams {
  sheet: SheetDocument;
  teamName: string;
  extension: 'pdf' | 'zip';
}

interface FilenameAttributes {
  sheetNo: string;
  teamName: string;
}

@Injectable()
export class PdfService implements OnModuleInit {
  private gradingFilename: Template<FilenameAttributes> | undefined;

  constructor(
    private readonly attendancePDF: AttendancePDFGenerator,
    private readonly credentialsPDF: CredentialsPDFGenerator,
    private readonly scheinResultsPDF: ScheinResultsPDFGenerator,
    private readonly scheinexamResultPDF: ScheinexamResultPDFGenerator,
    private readonly markdownPDF: MarkdownPDFGenerator,
    private readonly markdownService: MarkdownService,
    private readonly sheetService: SheetService,
    private readonly settingsService: SettingsService
  ) {}

  async onModuleInit(): Promise<void> {
    await this.loadFilenameTemplate();
  }

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
  async generateGradingPDF(
    params: GenerateTeamGradingParams
  ): Promise<Buffer | NodeJS.ReadableStream> {
    const sheet = await this.sheetService.findById(params.sheetId);
    const teamData = await this.markdownService.getTeamGrading(params);
    const dataCount = teamData.markdownData.length;

    if (dataCount <= 1) {
      return this.markdownPDF.generatePDF({
        markdown: teamData.markdownData[0]?.markdown ?? '',
      });
    } else {
      const data: ZipData[] = [];

      for (const { markdown, teamName } of teamData.markdownData) {
        const pdf = await this.markdownPDF.generatePDF({ markdown });
        data.push({
          filename: await this.getGradingFilename({ sheet, teamName, extension: 'pdf' }),
          payload: pdf,
        });
      }

      return this.generateZIP(data);
    }
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
    const sheet = await this.sheetService.findById(params.sheetId);
    const { markdownData: markdownForGradings } = await this.markdownService.getAllTeamsGradings(
      params
    );
    const files: ZipData[] = [];

    for (const gradingMD of markdownForGradings) {
      files.push({
        filename: await this.getGradingFilename({
          sheet,
          teamName: gradingMD.teamName,
          extension: 'pdf',
        }),
        payload: await this.markdownPDF.generatePDF({ markdown: gradingMD.markdown }),
      });
    }

    return this.generateZIP(files);
  }

  /**
   * Generates a ZIP file containing the given data.
   *
   * @param data Data to put into the ZIP file.
   *
   * @returns NodeJS.ReadableStream of the created ZIP file.
   */
  private generateZIP(data: ZipData[]): NodeJS.ReadableStream {
    const zip = new JSZip();

    data.forEach(({ filename, payload }) => {
      zip.file(filename, payload, { binary: true });
    });

    return zip.generateNodeStream({ type: 'nodebuffer' });
  }

  /**
   * Creates a filename from the given sheet number and teamname.
   *
   * This function behaves like a sync function except the `this.filenameTemplate` property is not set yet. If it is set no internal async calls are made.
   *
   * @param sheet Sheet
   * @param teamName Name of the team.
   * @param extension Extension of the filename. Either 'pdf' or 'zip'. (__without__ leading '.').
   */
  private async getGradingFilename({
    sheet,
    teamName,
    extension,
  }: FileNameParams): Promise<string> {
    if (!this.gradingFilename) {
      Logger.debug('Loading filename template from getFilenameInZip...', 'PdfService');
      await this.loadFilenameTemplate();
    }

    const filename =
      this.gradingFilename?.({ sheetNo: sheet.sheetNoAsString, teamName }) ?? 'NO_FILE_NAME';

    return `${filename}.${extension}`;
  }

  /**
   * Loads and compiles the template string for the gradings filename.
   *
   * Afterwards the `this.filenameTemplate` property is set to the compiled template.
   */
  private async loadFilenameTemplate(): Promise<void> {
    const { gradingFilename: gradingFileName } = await this.settingsService.getClientSettings();
    let parsedGradingFilename: string;

    if (gradingFileName.startsWith('|')) {
      parsedGradingFilename = gradingFileName;
    } else {
      parsedGradingFilename = `|${gradingFileName}`;
    }

    this.gradingFilename = pug.compile(parsedGradingFilename);
  }
}
