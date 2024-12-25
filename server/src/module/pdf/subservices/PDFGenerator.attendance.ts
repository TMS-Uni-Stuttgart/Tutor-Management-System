import { BadRequestException, Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { getNameOfEntity, sortByName } from 'shared/util/helpers';
import { TemplateService } from '../../template/template.service';
import { TutorialService } from '../../tutorial/tutorial.service';
import { PDFGenerator } from './PDFGenerator.core';

interface GeneratorOptions {
    tutorialId: string;
    date: DateTime;
}

@Injectable()
export class AttendancePDFGenerator extends PDFGenerator<GeneratorOptions> {
    constructor(
        private readonly tutorialService: TutorialService,
        private readonly templateService: TemplateService
    ) {
        super();
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

        if (tutorial.tutors.getItems().length === 0) {
            throw new BadRequestException(
                'Tutorial which attendance list should be generated does NOT have a tutor assigned.'
            );
        }

        const { tutors, slot: tutorialSlot } = tutorial;
        const tutorNames = tutors
            .getItems()
            .map((tutor) => getNameOfEntity(tutor))
            .join('; ');
        const template = this.templateService.getAttendanceTemplate();
        const students = tutorial.getStudents();
        const content = template({
            date,
            students: students.sort(sortByName).map((s) => ({ name: getNameOfEntity(s) })),
            tutorNames,
            tutorialSlot,
        });

        return this.generatePDFFromBodyContent(content);
    }
}
