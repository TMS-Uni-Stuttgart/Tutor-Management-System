import { Injectable } from '@nestjs/common';
import { StudentStatus } from 'shared/model/Student';
import { Scheinexam } from '../../../database/entities/scheinexam.entity';
import { ScheinexamService } from '../../scheinexam/scheinexam.service';
import { GradingService, StudentAndGradings } from '../../student/grading.service';
import { StudentService } from '../../student/student.service';
import { TemplateService } from '../../template/template.service';
import { PassedState, ScheinexamStatus } from '../../template/template.types';
import { PDFWithStudentsGenerator } from './PDFGenerator.withStudents';

interface PDFGeneratorOptions {
    id: string;
    enableShortMatriculationNo: boolean;
}

interface GetResultsParams {
    exam: Scheinexam;
    studentsAndGradings: StudentAndGradings[];
}

interface ExamResultsByStudents {
    [studentId: string]: PassedState;
}

@Injectable()
export class ScheinexamResultPDFGenerator extends PDFWithStudentsGenerator<PDFGeneratorOptions> {
    constructor(
        private readonly studentService: StudentService,
        private readonly scheinexamService: ScheinexamService,
        private readonly templateService: TemplateService,
        private readonly gradingService: GradingService
    ) {
        super();
    }

    /**
     * Generates a PDF from the given students with their results of the given Scheinexam. Students which are INACTIVE are getting ignored aswell as students which don't have a matriculation number (due to not being able to put those students in the PDF in an "anonymous" way).
     *
     * @param options Must contain a ScheinexamDocument and an array of StudentDocument.
     *
     * @returns Buffer containing a PDF which itself contains the results of the given students of the given exam.
     */
    public async generatePDF({
        id,
        enableShortMatriculationNo,
    }: PDFGeneratorOptions): Promise<Buffer> {
        const [exam, allStudents] = await Promise.all([
            this.scheinexamService.findById(id),
            this.studentService.findAll(),
        ]);
        const students = allStudents
            .filter((student) => !!student.matriculationNo)
            .filter((student) => student.status !== StudentStatus.INACTIVE);
        const studentsAndGradings =
            await this.gradingService.findAllGradingsOfMultipleStudents(students);
        const shortenedMatriculationNumbers = this.getShortenedMatriculationNumbers(students);
        const results = this.getResultsOfAllStudents({ exam, studentsAndGradings });

        const statuses: ScheinexamStatus[] = [];
        const template = this.templateService.getScheinexamTemplate();

        shortenedMatriculationNumbers.forEach(({ studentId, shortenedNo }) => {
            const state = results[studentId] ?? PassedState.NOT_ATTENDED;

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

        return this.generatePDFFromBodyContent(
            template({ scheinExamNo: exam.scheinExamNo, statuses })
        );
    }

    /**
     * Returns the results of all given students for the given exam. Those results are mapped with the student's id as a key and the result as value.
     *
     * @param Options Options containing the exam and all students to get the results from.
     *
     * @returns The results of all students mapped by their ID.
     */
    private getResultsOfAllStudents({
        exam,
        studentsAndGradings,
    }: GetResultsParams): ExamResultsByStudents {
        const results: ExamResultsByStudents = {};

        studentsAndGradings.forEach(({ student, gradingsOfStudent }) => {
            const examGrading = gradingsOfStudent.getGradingOfHandIn(exam);
            const hasAttended = examGrading !== undefined;

            if (hasAttended) {
                results[student.id] = exam.hasPassed(student, gradingsOfStudent)
                    ? PassedState.PASSED
                    : PassedState.NOT_PASSED;
            } else {
                results[student.id] = PassedState.NOT_ATTENDED;
            }
        });

        return results;
    }
}
