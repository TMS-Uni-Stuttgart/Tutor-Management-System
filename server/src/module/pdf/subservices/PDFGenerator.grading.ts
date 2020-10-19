import { Injectable } from '@nestjs/common';
import JSZip from 'jszip';
import { SheetDocument } from '../../../database/models/sheet.model';
import { MarkdownService } from '../../markdown/markdown.service';
import {
  GenerateAllTeamsGradingParams,
  GenerateTeamGradingParams,
  SingleTeamGradings,
} from '../../markdown/markdown.types';
import { SheetService } from '../../sheet/sheet.service';
import { FileService } from '../file.service';
import { MarkdownPDFGenerator } from './PDFGenerator.markdown';

interface ZipData {
  filename: string;
  payload: Buffer;
}

interface ConvertZipParams {
  sheet: SheetDocument;
  teamData: SingleTeamGradings;
}

@Injectable()
export class GradingPDFGenerator extends MarkdownPDFGenerator {
  constructor(
    private readonly sheetService: SheetService,
    private readonly fileService: FileService,
    markdownService: MarkdownService
  ) {
    super(markdownService);
  }

  /**
   * Generates a PDF from the grading of the given team for the given sheet.
   *
   * @param params Options passed to the markdown generation function.
   *
   * @returns Buffer or NodeJS.ReadableStream containing the generated PDF.
   *
   * @throws `NotFoundException` - If either no team with the given ID or no sheet with the given ID could be found.
   * @throws `BadRequestException` - If the given team does not have any students or the students do not hold a grading for the given sheet.
   */
  async generateTeamGradingFiles(
    params: GenerateTeamGradingParams
  ): Promise<Buffer | NodeJS.ReadableStream> {
    const sheet = await this.sheetService.findById(params.sheetId);
    const teamData = await this.markdownService.getTeamGrading(params);
    const dataCount = teamData.markdownData.length;

    if (dataCount <= 1) {
      return await this.generatePDF({
        markdown: teamData.markdownData[0]?.markdown ?? '',
      });
    } else {
      return this.convertToZip({ sheet, teamData });
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
        filename: await this.fileService.getGradingFilename({
          sheet,
          teamName: gradingMD.teamName,
          extension: 'pdf',
        }),
        payload: await this.generatePDF({ markdown: gradingMD.markdown }),
      });
    }

    return this.generateZIP(files);
  }

  /**
   * Generates a ZIP file containing the PDFs generated from the given teamData.
   *
   * @param params Params to generate the ZIP file from.
   *
   * @returns Zip file content and metadata.
   */
  private async convertToZip({
    sheet,
    teamData,
  }: ConvertZipParams): Promise<NodeJS.ReadableStream> {
    const data: ZipData[] = [];

    for (const { markdown, teamName } of teamData.markdownData) {
      const pdf = await this.generatePDF({ markdown });
      data.push({
        filename: await this.fileService.getGradingFilename({ sheet, teamName, extension: 'pdf' }),
        payload: pdf,
      });
    }

    return this.generateZIP(data);
  }

  /**
   * Generates a ZIP file containing the given data.
   *
   * @param data Data to put into the ZIP file.
   *
   * @returns NodeJS.ReadableStream of the generated ZIP file.
   */
  private generateZIP(data: ZipData[]): NodeJS.ReadableStream {
    const zip = new JSZip();

    data.forEach(({ filename, payload }) => {
      zip.file(filename, payload, { binary: true });
    });

    return zip.generateNodeStream({ type: 'nodebuffer' });
  }
}
