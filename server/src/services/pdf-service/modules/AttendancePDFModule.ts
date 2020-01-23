import { format } from 'date-fns';
import { getNameOfEntity, sortByName } from 'shared/dist/util/helpers';
import { getIdOfDocumentRef } from '../../../helpers/documentHelpers';
import { TutorialDocument } from '../../../model/documents/TutorialDocument';
import { BadRequestError } from '../../../model/Errors';
import userService from '../../user-service/UserService.class';
import { PDFModule } from './PDFModule';

interface GeneratorOptions {
  tutorial: TutorialDocument;
  date: Date;
}

interface PlaceholderOptions {
  tutorialSlot: string;
  tutorName: string;
  tableRows: string[];
  date: Date;
}

export class AttendancePDFModule extends PDFModule<GeneratorOptions> {
  constructor() {
    super('attendance.html');
  }

  /**
   * Generates a PDF which contains a list with all students of the given tutorial. This list contains one empty column for signings.
   *
   * @param options Must contain the tutorial and the date.
   *
   * @returns Buffer containing a PDF with a list for attendances.
   */
  public async generatePDF({ tutorial, date }: GeneratorOptions): Promise<Buffer> {
    if (!tutorial.tutor) {
      throw new BadRequestError(
        'Tutorial which attendance list should be generated does NOT have a tutor assigned.'
      );
    }

    const [tutor, students] = await Promise.all([
      userService.getUserWithId(getIdOfDocumentRef(tutorial.tutor)),
      tutorial.getStudents(),
    ]);

    students.sort(sortByName);

    const tutorName = getNameOfEntity(tutor);
    const tableRows: string[] = students.map(
      student =>
        `<tr><td>${getNameOfEntity(student)}</td><td width="50%"></td></tr>`
    );

    const body = this.replacePlaceholdersInTemplate({
      tutorialSlot: tutorial.slot,
      tutorName,
      tableRows,
      date,
    });

    return this.generatePDFFromBody(body);
  }

  /**
   * Replaces the following placeholders in the template with the corresponding information. The adjusted template gets returned.
   * - `{{tutorialSlot}}`: Slot of the tutorial.
   * - `{{tutorName}}`: Name of the tutor of the tutorial.
   * - `{{statuses}}`: The table rows will be put in here.
   * - `{{date, format}}`: The given date but with the specified format inside the template.
   *
   * @param options Containing the information which will get replaced in the template.
   *
   * @returns String containing the template but with the actual information.
   */
  private replacePlaceholdersInTemplate({
    tutorialSlot,
    tutorName,
    tableRows,
    date,
  }: PlaceholderOptions): string {
    const template = this.getTemplate();

    return template
      .replace(/{{tutorialSlot}}/g, tutorialSlot)
      .replace(/{{tutorName}}/g, tutorName)
      .replace(/{{students}}/g, tableRows.join(''))
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
}
