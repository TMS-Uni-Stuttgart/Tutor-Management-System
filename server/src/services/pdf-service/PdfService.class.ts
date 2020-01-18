import JSZip from 'jszip';
import MarkdownIt from 'markdown-it';
import puppeteer from 'puppeteer';
import { User } from 'shared/dist/model/User';
import Logger from '../../helpers/Logger';
import { StudentDocument } from '../../model/documents/StudentDocument';
import markdownService, { TeamCommentData } from '../markdown-service/MarkdownService.class';
import scheincriteriaService from '../scheincriteria-service/ScheincriteriaService.class';
import scheinexamService from '../scheinexam-service/ScheinexamService.class';
import sheetService from '../sheet-service/SheetService.class';
import studentService from '../student-service/StudentService.class';
import teamService from '../team-service/TeamService.class';
import tutorialService from '../tutorial-service/TutorialService.class';
import userService from '../user-service/UserService.class';
import githubMarkdownCSS from './css/githubMarkdown';
import { AttendancePDFModule } from './modules/AttendancePDFModule';
import { CredentialsPDFModule } from './modules/CredentialsPDFModule';
import { ScheinexamResultPDFModule } from './modules/ScheinexamResultPDFModule';
import { ScheinResultsPDFModule } from './modules/ScheinResultsPDFModule';

class PdfService {
  private readonly attendancePDFModule: AttendancePDFModule;
  private readonly scheinResultsPDFModule: ScheinResultsPDFModule;
  private readonly credentialsPDFModule: CredentialsPDFModule;
  private readonly scheinexamResultsPDFModule: ScheinexamResultPDFModule;

  constructor() {
    this.attendancePDFModule = new AttendancePDFModule();
    this.scheinResultsPDFModule = new ScheinResultsPDFModule();
    this.credentialsPDFModule = new CredentialsPDFModule();
    this.scheinexamResultsPDFModule = new ScheinexamResultPDFModule();
  }

  public async generateAttendancePDF(tutorialId: string, date: Date): Promise<Buffer> {
    const tutorial = await tutorialService.getDocumentWithID(tutorialId);

    return this.attendancePDFModule.generatePDF({ tutorial, date });
  }

  public async generateStudentScheinOverviewPDF(): Promise<Buffer> {
    const [students, summaries] = await Promise.all([
      studentService.getAllStudentsAsDocuments(),
      scheincriteriaService.getCriteriaResultsOfAllStudents(),
    ]);

    return this.scheinResultsPDFModule.generatePDF({ students, summaries });
  }

  public async generateCredentialsPDF(): Promise<Buffer> {
    const users: User[] = await userService.getAllUsers();

    return this.credentialsPDFModule.generatePDF({ users });
  }

  public async generatePDFFromSingleComment(
    tutorialId: string,
    sheetId: string,
    teamId: string
  ): Promise<Buffer> {
    const [team] = await teamService.getDocumentWithId(tutorialId, teamId);
    const { markdown } = await markdownService.generateMarkdownFromTeamComment({
      team,
      sheetId,
    });

    return this.generatePDFFromMarkdown(markdown);
  }

  public async generateScheinexamResultPDF(examId: string): Promise<Buffer> {
    const exam = await scheinexamService.getDocumentWithId(examId);
    const students: StudentDocument[] = await studentService.getAllStudentsAsDocuments();

    return this.scheinexamResultsPDFModule.generatePDF({ exam, students });
  }

  public async generateZIPFromComments(
    tutorialId: string,
    sheetId: string
  ): Promise<NodeJS.ReadableStream> {
    const tutorial = await tutorialService.getDocumentWithID(tutorialId);
    const sheet = await sheetService.getDocumentWithId(sheetId);

    const commentsByTeam: TeamCommentData[] = [];
    const sheetNo = sheet.sheetNo.toString().padStart(2, '0');

    for (const team of tutorial.teams) {
      commentsByTeam.push(await markdownService.generateMarkdownFromTeamComment({ team, sheetId }));
    }

    const files: { filename: string; payload: Buffer }[] = [];

    for (const comment of commentsByTeam) {
      files.push({
        filename: `Ex${sheetNo}_${comment.teamName}.pdf`, // TODO: Make template.
        payload: await this.generatePDFFromMarkdown(comment.markdown),
      });
    }

    const zip = new JSZip();

    files.forEach(({ filename, payload }) => {
      zip.file(filename, payload, { binary: true });
    });

    return zip.generateNodeStream({ type: 'nodebuffer' });
  }

  private async generatePDFFromMarkdown(markdown: string): Promise<Buffer> {
    const html = this.generateHTMLFromMarkdown(markdown);

    return this.getPDFFromHTML(html);
  }

  private generateHTMLFromMarkdown(markdown: string): string {
    const parser = new MarkdownIt();
    const body = parser.render(markdown);

    return this.putBodyInHtml(body);
  }

  private putBodyInHtml(body: string): string {
    return `<html><head><style>${this.getGithubMarkdownCSS()}</style><style>${this.getCustomCSS()}</style></head><body class="markdown-body">${body}</body></html>`;
  }

  private async getPDFFromHTML(html: string): Promise<Buffer> {
    let browser: puppeteer.Browser | undefined;

    Logger.debug('Starting browser...');
    Logger.debug(`\tExec path: ${process.env.TMS_PUPPETEER_EXEC_PATH}`);

    try {
      browser = await puppeteer.launch({
        args: ['--disable-dev-shm-usage'],
        executablePath: process.env.TMS_PUPPETEER_EXEC_PATH,
      });

      Logger.debug('Browser startet.');

      const page = await browser.newPage();
      Logger.debug('Page created.');

      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      Logger.debug('Page content loaded');

      const buffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '1cm',
          right: '1cm',
          bottom: '1cm',
          left: '1cm',
        },
      });

      Logger.debug('PDF created.');

      await browser.close();

      Logger.debug('Browser closed');

      return buffer;
    } catch (err) {
      if (browser) {
        browser.close();
      }

      Logger.error(JSON.stringify(err, null, 2));

      throw err;
    }
  }

  private getGithubMarkdownCSS(): string {
    return githubMarkdownCSS;
  }

  private getCustomCSS(): string {
    return '.markdown-body table { display: table; width: 100%; }';
  }
}

const pdfService = new PdfService();

export default pdfService;
