import { format } from 'date-fns';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { ScheincriteriaSummaryByStudents } from 'shared/dist/model/ScheinCriteria';
import { Student } from 'shared/dist/model/Student';
import { Tutorial } from 'shared/dist/model/Tutorial';
import { BadRequestError } from '../../model/Errors';
import scheincriteriaService from '../scheincriteria-service/ScheincriteriaService.class';
import studentService from '../student-service/StudentService.class';
import tutorialService from '../tutorial-service/TutorialService.class';
import userService from '../user-service/UserService.class';
import githubMarkdownCSS from './css/githubMarkdown';

interface StudentData {
  matriculationNo: string;
  schein: string;
}

class PdfService {
  private githubMarkdownCSS: string = '';

  public async generateAttendancePDF(tutorialId: string, date: Date): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const tutorial = await tutorialService.getTutorialWithID(tutorialId);

        const body: string = await this.generateAttendanceHTML(tutorial, date);
        const html = this.putBodyInHtml(body);

        const buffer = await this.getPDFFromHTML(html);

        resolve(buffer);
      } catch (err) {
        reject(err);
      }
    });
  }

  public generateStudentScheinOverviewPDF(): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const [students, summaries] = await Promise.all([
          studentService.getAllStudents(),
          scheincriteriaService.getCriteriaResultsOfAllStudents(),
        ]);

        const body = await this.generateScheinStatusHTML(students, summaries);
        const html = this.putBodyInHtml(body);

        const buffer = await this.getPDFFromHTML(html);

        resolve(buffer);
      } catch (err) {
        reject(err);
      }
    });
  }

  private getAttendanceTemplate(): string {
    try {
      const filePath = path.join(process.cwd(), 'config', 'html', 'attendance.html');

      return fs.readFileSync(filePath).toString();
    } catch {
      throw new BadRequestError('No template file present for attendance sheet (attendance.html).');
    }
  }

  private getScheinStatusTemplate(): string {
    try {
      const filePath = path.join(process.cwd(), 'config', 'html', 'scheinstatus.html');

      return fs.readFileSync(filePath).toString();
    } catch {
      throw new BadRequestError(
        'No template file present for schein status overview sheet (scheinstatus.html).'
      );
    }
  }

  private async generateAttendanceHTML(tutorial: Tutorial, date: Date): Promise<string> {
    if (!tutorial.tutor) {
      throw new BadRequestError(
        'Tutorial which attendance list should be generated does NOT have a tutor assigned.'
      );
    }

    const template = this.getAttendanceTemplate();

    const tutor = await userService.getUserWithId(tutorial.tutor);
    const students: Student[] = await Promise.all(
      tutorial.students.map(student => studentService.getStudentWithId(student))
    );
    // const substitutePart = isSubstituteTutor(tutorial, userData)
    //   ? `, Ersatztutor: ${getNameOfEntity(userData)}`
    //   : '';

    const tutorName = `${tutor.lastname}, ${tutor.firstname}`;

    const rows: string = students
      .map(
        student =>
          `<tr><td>${student.lastname}, ${student.firstname}</td><td width="50%"></td></tr>`
      )
      .join('');

    return this.fillAttendanceTemplate(template, tutorial.slot, tutorName, rows, date);
  }

  private fillAttendanceTemplate(
    template: string,
    slot: string,
    tutorName: string,
    students: string,
    date: Date
  ): string {
    return this.prepareTemplate(template)
      .replace(/{{tutorialSlot}}/g, slot)
      .replace(/{{tutorName}}/g, tutorName)
      .replace(/{{students}}/g, students)
      .replace(/{{date.*}}/g, substring => {
        const dateFormat = substring.split(',').map(s => s.replace(/{{|}}/, ''))[1];

        try {
          if (dateFormat) {
            return format(date, dateFormat);
          } else {
            return date.toDateString();
          }
        } catch {
          return date.toDateString();
        }
      });
  }

  private async generateScheinStatusHTML(
    students: Student[],
    summaries: ScheincriteriaSummaryByStudents
  ): Promise<string> {
    const template = this.getScheinStatusTemplate();
    const studentDataToPrint: StudentData[] = this.getStudentDataToPrint(students, summaries);

    const rows: string[] = [];

    studentDataToPrint.forEach(data => {
      rows.push(`<tr><td>${data.matriculationNo}</td><td>${data.schein}</td></tr>`);
    });

    return this.fillScheinStatusTemplate(template, rows.join(''));
  }

  private fillScheinStatusTemplate(template: string, statuses: string): string {
    return this.prepareTemplate(template).replace(/{{statuses.*}}/g, substring => {
      const wordArray = substring.match(/(\[(\w|\s)*,(\w|\s)*\])/g);
      const replacements = { yes: 'yes', no: 'no' };

      if (wordArray && wordArray[0]) {
        const [yes, no] = wordArray[0]
          .replace(/\[|\]|/g, '')
          .replace(/,\s*/g, ',')
          .split(',');

        replacements.yes = yes || replacements.yes;
        replacements.no = no || replacements.no;
      }

      return this.prepareTemplate(statuses)
        .replace(/{{yes}}/g, replacements.yes)
        .replace(/{{no}}/g, replacements.no);
    });
  }

  private getStudentDataToPrint(
    students: Student[],
    summaries: ScheincriteriaSummaryByStudents
  ): StudentData[] {
    const studentDataToPrint: { matriculationNo: string; schein: string }[] = [];

    students.forEach(student => {
      studentDataToPrint.push({
        matriculationNo: this.getShortenedMatrNo(student, students),
        schein: summaries[student.id].passed ? '{{yes}}' : '{{no}}',
      });
    });

    studentDataToPrint.sort((a, b) => a.matriculationNo.localeCompare(b.matriculationNo));

    return studentDataToPrint;
  }

  private getShortenedMatrNo(student: Student, students: Student[]): string {
    const otherStudents = students.filter(s => s.id !== student.id);
    const lengthOfNo = student.matriculationNo.length;

    for (let iteration = 1; iteration < lengthOfNo; iteration++) {
      const shortStudent = student.matriculationNo.substr(lengthOfNo - iteration, iteration);
      let isOkay = true;

      for (const otherStudent of otherStudents) {
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

  private prepareTemplate(template: string): string {
    return template
      .replace(/{{\s+/g, '{{')
      .replace(/\s+}}/g, '}}')
      .replace(/(?=<!--)([\s\S]*?)-->/gim, '');
  }

  private putBodyInHtml(body: string): string {
    return `<html><head><style>${this.getGithubMarkdownCSS()}</style><style>${this.getCustomCSS()}</style></head><body class="markdown-body">${body}</body></html>`;
  }

  private async getPDFFromHTML(html: string): Promise<Buffer> {
    let browser: puppeteer.Browser | undefined = undefined;

    try {
      browser = await puppeteer.launch({
        args: ['--disable-dev-shm-usage'],
      });

      const page = await browser.newPage();
      await page.setContent(html);

      const buffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '1cm',
          right: '1cm',
          bottom: '1cm',
          left: '1cm',
        },
      });

      await browser.close();

      return buffer;
    } catch (err) {
      if (browser) {
        browser.close();
      }

      throw err;
    }
  }

  private getGithubMarkdownCSS(): string {
    return githubMarkdownCSS;
  }

  private getCustomCSS(): string {
    return '.markdown-body table { display: table; width: 100%; background: red; }';
  }
}

const pdfService = new PdfService();

export default pdfService;
