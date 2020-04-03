import { BadRequestException, Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { getNameOfEntity, sortByName } from '../../../shared/util/helpers';
import { TutorialService } from '../../tutorial/tutorial.service';
import { PDFGenerator } from './PDFGenerator.core';

interface GeneratorOptions {
  tutorialId: string;
  date: DateTime;
}

interface PlaceholderOptions {
  tutorialSlot: string;
  tutorName: string;
  tableRows: string[];
  date: DateTime;
}

@Injectable()
export class AttendancePDFGenerator extends PDFGenerator<GeneratorOptions> {
  constructor(private readonly tutorialService: TutorialService) {
    super('attendance.html');
  }

  /**
   * Generates a PDF which contains a list with all students of the given tutorial. This list contains one empty column for signings.
   *
   * @param options Must contain the tutorialId and the date.
   *
   * @returns Buffer containing a PDF with a list for attendances.
   *
   * @throws `NotFoundException` - If no tutorial with the given ID could be found.
   * @throws `BadRequestException` - If the tutorial does not have a tutor assigned to it.
   */
  public async generatePDF({ tutorialId, date }: GeneratorOptions): Promise<Buffer> {
    const tutorial = await this.tutorialService.findById(tutorialId);

    if (!tutorial.tutor) {
      throw new BadRequestException(
        'Tutorial which attendance list should be generated does NOT have a tutor assigned.'
      );
    }

    const { tutor, students } = tutorial;
    const tutorName = getNameOfEntity(tutor);
    const tableRows: string[] = students
      .sort(sortByName)
      .map((student) => `<tr><td>${getNameOfEntity(student)}</td><td width="50%"></td></tr>`);

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
      .replace(/{{date.*}}/g, (substring) => {
        const dateFormat = substring.split(',').map((s) => s.replace(/{{|}}/, ''))[1];

        try {
          if (dateFormat) {
            return date.toFormat(dateFormat);
          } else {
            return date.toISODate();
          }
        } catch {
          return date.toISODate();
        }
      });
  }
}
