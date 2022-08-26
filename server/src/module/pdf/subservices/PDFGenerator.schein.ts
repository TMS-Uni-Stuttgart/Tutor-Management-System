import { Injectable } from '@nestjs/common';
import { ScheincriteriaService } from '../../scheincriteria/scheincriteria.service';
import { StudentService } from '../../student/student.service';
import { TemplateService } from '../../template/template.service';
import { PassedState, Scheinstatus } from '../../template/template.types';
import { PDFWithStudentsGenerator } from './PDFGenerator.withStudents';
import { StudentStatus } from 'shared/model/Student';

interface GeneratorOptions {
    enableShortMatriculationNo: boolean;
}

@Injectable()
export class ScheinResultsPDFGenerator extends PDFWithStudentsGenerator<GeneratorOptions> {
    constructor(
        private readonly studentService: StudentService,
        private readonly scheincriteriaService: ScheincriteriaService,
        private readonly templateService: TemplateService
    ) {
        super();
    }

    /**
     * Generates a PDF which shows a list of all students and their schein status.
     *
     * @param options Determine if the matriculation numbers are shortened or not.
     *
     * @returns Buffer of a PDF containing the list with the schein status of all the given students.
     */
    public async generatePDF({ enableShortMatriculationNo }: GeneratorOptions): Promise<Buffer> {
        const summaries = await this.scheincriteriaService.getResultsOfAllStudents();

        const students = Object.values(summaries)
            .map((s) => s.student)
            .filter((student) => !!student.matriculationNo);
        const shortenedMatriculationNumbers = this.getShortenedMatriculationNumbers(students);
        const statuses: Scheinstatus[] = [];
        const template = this.templateService.getScheinstatusTemplate();

        shortenedMatriculationNumbers.forEach(({ shortenedNo, studentId }) => {
            const summary = summaries[studentId];
            let state: PassedState;

            if (summary.student.status === StudentStatus.NO_SCHEIN_REQUIRED) {
                state = PassedState.ALREADY_HAS_SCHEIN;
            } else {
                state = summaries[studentId].passed ? PassedState.PASSED : PassedState.NOT_PASSED;
            }

            if (enableShortMatriculationNo) {
                statuses.push({ matriculationNo: shortenedNo, state });
            } else {
                const matriculationNo = students.find((s) => s.id === studentId)?.matriculationNo;
                statuses.push({
                    matriculationNo: `${matriculationNo} (${shortenedNo})`,
                    state,
                });
            }
        });

        return this.generatePDFFromBodyContent(template({ statuses }));
    }
}
