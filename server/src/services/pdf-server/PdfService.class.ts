import { format } from 'date-fns';
import fs, { ReadStream } from 'fs';
import pdf from 'html-pdf';
import path from 'path';
import { Student } from 'shared/dist/model/Student';
import { Tutorial } from 'shared/dist/model/Tutorial';
import { BadRequestError } from '../../model/Errors';
import studentService from '../student-service/StudentService.class';
import tutorialService from '../tutorial-service/TutorialService.class';
import userService from '../user-service/UserService.class';

class PdfService {
  private githubMarkdownCSS: string = '';

  public async generateAttendancePDF(tutorialId: string, date: Date): Promise<ReadStream> {
    return new Promise(async (resolve, reject) => {
      const tutorial = await tutorialService.getTutorialWithID(tutorialId);

      const body: string = await this.generateAttendanceHTML(tutorial, date);
      const html = `<html><head><style>${this.getGithubMarkdownCSS()}</style></head><body class="markdown-body">${body}</body></html>`;

      pdf
        .create(html, {
          format: 'A4',
          orientation: 'portrait',
          border: '1cm',
        })
        .toStream((err, stream) => {
          if (err) {
            reject(new BadRequestError(String(err)));
          } else {
            resolve(stream);
          }
        });
    });
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

  private getGithubMarkdownCSS(): string {
    if (!this.githubMarkdownCSS) {
      this.githubMarkdownCSS = fs
        .readFileSync(path.join(__dirname, 'css', 'githubMarkdown.css'))
        .toString();
    }

    return this.githubMarkdownCSS;
  }

  private getAttendanceTemplate(): string {
    try {
      const filePath = path.join(process.cwd(), 'config', 'html', 'attendance.html');

      return fs.readFileSync(filePath).toString();
    } catch {
      throw new BadRequestError('No template file present for attendance sheet.');
    }
  }

  private fillAttendanceTemplate(
    template: string,
    slot: string,
    tutorName: string,
    students: string,
    date: Date
  ): string {
    return template
      .replace(/{{\s+/g, '{{')
      .replace(/\s+}}/g, '}}')
      .replace(/{{tutorialSlot}}/g, slot)
      .replace(/{{tutorName}}/g, tutorName)
      .replace(/{{students}}/g, students)
      .replace(/{{date.*}}/, substring => {
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
}

const pdfService = new PdfService();

export default pdfService;
