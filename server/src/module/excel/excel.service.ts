import { Injectable, Logger } from '@nestjs/common';
import xl, { Workbook, Worksheet } from 'excel4node';
import { parse } from 'papaparse';
import { AttendanceState } from 'shared/model/Attendance';
import { ParseCsvResult } from 'shared/model/CSV';
import { StudentStatus } from 'shared/model/Student';
import { Sheet } from '../../database/entities/sheet.entity';
import { Student } from '../../database/entities/student.entity';
import { Tutorial } from '../../database/entities/tutorial.entity';
import { ScheincriteriaService } from '../scheincriteria/scheincriteria.service';
import { SheetService } from '../sheet/sheet.service';
import { GradingService, StudentAndGradings } from '../student/grading.service';
import { StudentService } from '../student/student.service';
import { PassedState } from '../template/template.types';
import { TutorialService } from '../tutorial/tutorial.service';
import { UserService } from '../user/user.service';
import { ParseCsvDTO } from './excel.dto';

interface HeaderData {
    name: string;
    column: number;
}

interface CellDataBase {
    content: string | number;
    row: number;
    type?: 'string' | 'number';
}

interface CellStringData extends CellDataBase {
    type?: 'string';
    content: string;
}

interface CellNumberData extends CellDataBase {
    type: 'number';
    content: number;
}

type CellData = CellStringData | CellNumberData;

type HeaderDataCollection<T extends string> = {
    [key in T]: HeaderData;
};

type CellDataCollection<T extends string> = {
    [key in T]: CellData[];
};

type MemberKeys =
    | 'firstname'
    | 'lastname'
    | 'status'
    | 'matriculationNo'
    | 'courseOfStudies'
    | 'email';

type ScheinstatusKeys =
    | 'firstname'
    | 'lastname'
    | 'status'
    | 'matriculationNo'
    | 'tutorial'
    | 'email';

@Injectable()
export class ExcelService {
    private readonly logger = new Logger(ExcelService.name);

    constructor(
        private readonly tutorialService: TutorialService,
        private readonly sheetService: SheetService,
        private readonly studentService: StudentService,
        private readonly userService: UserService,
        private readonly scheincriteriaService: ScheincriteriaService,
        private readonly gradingService: GradingService
    ) {}

    /**
     * Generates a XLSX with the data of the given tutorial. The generated XLSX is returned as a Buffer in the end.
     *
     * @param tutorialId ID of the tutorial to generate the XLSX for.
     *
     * @returns Buffer containing the XLSX.
     *
     * @throws `NotFoundException` - If there is no tutorial with the given ID.
     */
    async generateTutorialBackup(tutorialId: string): Promise<Buffer> {
        const tutorial = await this.tutorialService.findById(tutorialId);
        const sheets = await this.sheetService.findAll();
        const studentsAndGradings = await this.gradingService.findAllGradingsOfMultipleStudents(
            tutorial.getStudents()
        );
        const workbook = new xl.Workbook();

        sheets.sort((a, b) => a.sheetNo - b.sheetNo);

        this.createMemberWorksheet(workbook, tutorial.getStudents());
        this.createAttendanceWorksheet(workbook, tutorial, tutorial.getStudents());

        for (const sheet of sheets) {
            await this.createWorksheetForExerciseSheet(workbook, sheet, studentsAndGradings);
        }

        return workbook.writeToBuffer();
    }

    /**
     * Parses the given CSV string with the given options.
     *
     * Internally the papaparser is used to parse the string. If parsing fails the results papaparser result is still returned, but it will be in it's errornous state.
     *
     * @param dto DTO with the CSV string to parse and the options to use.
     *
     * @returns Parsed results from papaparser.
     */
    async parseCSV(dto: ParseCsvDTO): Promise<ParseCsvResult<unknown>> {
        const { data, options } = dto;

        return parse(data, options);
    }

    /**
     * Generates a XLSX file containing the information about the current schein status for each student.
     *
     * @returns Buffer containing the XLSX.
     */
    async generateScheinstatusTable(): Promise<Buffer> {
        const summaries = await this.scheincriteriaService.getResultsOfAllStudents();
        const workbook = new xl.Workbook();
        const sheet = workbook.addWorksheet('Schein statuses');

        const headers: HeaderDataCollection<ScheinstatusKeys> = {
            lastname: { name: 'Lastname', column: 1 },
            firstname: { name: 'Firstname', column: 2 },
            status: { name: 'Status', column: 3 },
            matriculationNo: { name: 'Matriculation No', column: 4 },
            tutorial: { name: 'Tutorial', column: 5 },
            email: { name: 'E-Mail', column: 6 },
        };
        const cells: CellDataCollection<ScheinstatusKeys> = {
            lastname: [],
            firstname: [],
            status: [],
            matriculationNo: [],
            tutorial: [],
            email: [],
        };

        let row = 2;
        for (const summary of Object.values(summaries)) {
            const { student, passed } = summary;
            const { firstname, lastname, matriculationNo, tutorial, email } = student;

            let state: PassedState;

            if (student.status === StudentStatus.NO_SCHEIN_REQUIRED) {
                state = PassedState.ALREADY_HAS_SCHEIN;
            } else {
                state = passed ? PassedState.PASSED : PassedState.NOT_PASSED;
            }

            cells['lastname'].push({ content: lastname, row });
            cells['firstname'].push({ content: firstname, row });
            cells['matriculationNo'].push({ content: matriculationNo || 'N/A', row });
            cells['tutorial'].push({ content: tutorial.slot, row });
            cells['status'].push({ content: state.toString(), row });
            cells['email'].push({ content: email ?? 'N/A', row });

            row++;
        }

        this.fillSheet(sheet, headers, cells);
        return workbook.writeToBuffer();
    }

    async generateCredentialsXLSX(): Promise<Buffer> {
        const users = await this.userService.findAll();
        const workbook = new xl.Workbook();
        const sheet = workbook.addWorksheet('User Credentials');

        const headers: HeaderDataCollection<
            'firstname' | 'lastname' | 'username' | 'email' | 'password'
        > = {
            firstname: { name: 'Firstname', column: 1 },
            lastname: { name: 'Lastname', column: 2 },
            username: { name: 'Username', column: 3 },
            email: { name: 'Email', column: 4 },
            password: { name: 'Temporary Password', column: 5 },
        };
        const cells: CellDataCollection<
            'firstname' | 'lastname' | 'username' | 'email' | 'password'
        > = {
            firstname: [],
            lastname: [],
            username: [],
            email: [],
            password: [],
        };

        let row = 2;
        for (const user of users.sort((a, b) => a.lastname.localeCompare(b.lastname))) {
            cells['firstname'].push({ content: user.firstname, row });
            cells['lastname'].push({ content: user.lastname, row });
            cells['username'].push({ content: user.username, row });
            cells['email'].push({ content: user.email || 'N/A', row });
            cells['password'].push({ content: user.temporaryPassword || 'N/A', row });

            row++;
        }

        this.fillSheet(sheet, headers, cells);
        return workbook.writeToBuffer();
    }

    private createMemberWorksheet(workbook: Workbook, students: Student[]) {
        const overviewSheet = workbook.addWorksheet('Teilnehmer');
        const headers: HeaderDataCollection<MemberKeys> = {
            firstname: { name: 'Vorname', column: 1 },
            lastname: { name: 'Nachname', column: 2 },
            status: { name: 'Status', column: 3 },
            matriculationNo: { name: 'Matrklnr.', column: 4 },
            courseOfStudies: { name: 'Studiengang', column: 5 },
            email: { name: 'E-Mail', column: 6 },
        };
        const cellData: CellDataCollection<MemberKeys> = {
            firstname: [],
            lastname: [],
            status: [],
            matriculationNo: [],
            courseOfStudies: [],
            email: [],
        };

        let row = 2;
        for (const student of students) {
            const { firstname, lastname, matriculationNo, courseOfStudies, email } = student;
            cellData['firstname'].push({ content: firstname, row });
            cellData['lastname'].push({ content: lastname, row });
            cellData['matriculationNo'].push({
                content: matriculationNo || 'N/A',
                row,
            });
            cellData['courseOfStudies'].push({
                content: courseOfStudies || 'N/A',
                row,
            });
            cellData['email'].push({ content: email || 'N/A', row });

            row++;
        }

        this.fillSheet(overviewSheet, headers, cellData);
    }

    private async createWorksheetForExerciseSheet(
        workbook: Workbook,
        sheet: Sheet,
        studentAndGradings: StudentAndGradings[]
    ) {
        const worksheet = workbook.addWorksheet(`Übungsblatt ${sheet.sheetNo}`);
        const headers: HeaderDataCollection<any> = {
            firstname: {
                name: 'Vorname',
                column: 1,
            },
            lastname: {
                name: 'Nachname',
                column: 2,
            },
            presentation: {
                name: 'Präsentationen',
                column: 3,
            },
        };
        const data: CellDataCollection<any> = {
            firstname: [],
            lastname: [],
            presentation: [],
        };

        let column = 4;
        for (const ex of sheet.exercises) {
            headers[ex.id] = {
                name: `Aufgabe ${ex.exerciseName}`,
                column,
            };
            data[ex.id] = [];
            column++;

            let row = 2;
            for (const { student, gradingsOfStudent } of studentAndGradings) {
                const grading = gradingsOfStudent.getGradingOfHandIn(sheet)?.getExerciseGrading(ex);

                data['firstname'].push({
                    content: student.firstname,
                    row,
                });

                data['lastname'].push({
                    content: student.lastname,
                    row,
                });

                if (!!grading) {
                    data[ex.id].push({
                        content: grading.points,
                        type: 'number',
                        row,
                    });
                } else {
                    data[ex.id].push({ content: 'N/A', row });
                }

                data['presentation'].push({
                    content: student.getPresentationPoints(sheet) ?? 0,
                    type: 'number',
                    row,
                });

                row++;
            }
        }

        this.fillSheet(worksheet, headers, data);
    }

    private createAttendanceWorksheet(workbook: Workbook, tutorial: Tutorial, students: Student[]) {
        const sheet = workbook.addWorksheet('Anwesenheiten');
        const headers: HeaderDataCollection<any> = {
            firstname: {
                name: 'Vorname',
                column: 1,
            },
            lastname: {
                name: 'Nachname',
                column: 2,
            },
        };
        const data: CellDataCollection<any> = {
            firstname: [],
            lastname: [],
        };

        let column = 3;
        for (const date of tutorial.dates) {
            const dateKey = date.toISO();

            if (!dateKey) {
                throw new Error(`Date '${date}' could not be parsed to an ISODate`);
            }

            headers[dateKey] = {
                name: date.toISODate() ?? 'DATE_NOT_PARSEABLE',
                column,
            };
            data[dateKey] = [];

            let row = 2;
            for (const student of students) {
                const attendance = student.getAttendance(date);
                data['firstname'].push({
                    content: student.firstname,
                    row,
                });
                data['lastname'].push({
                    content: student.lastname,
                    row,
                });

                if (attendance) {
                    data[dateKey].push({
                        content: attendance.state ?? AttendanceState.UNEXCUSED,
                        row,
                    });
                } else {
                    data[dateKey].push({
                        content: 'N/A',
                        row,
                    });
                }

                row++;
            }

            column++;
        }

        this.fillSheet(sheet, headers, data);
    }

    private fillSheet<T extends string>(
        sheet: Worksheet,
        headers: HeaderDataCollection<T>,
        cellData: CellDataCollection<T>
    ) {
        Object.entries<HeaderData>(headers).forEach(([_, header]) => {
            sheet.cell(1, header.column).string(header.name);
        });

        Object.entries<CellData[]>(cellData).forEach(([key, data]) => {
            const header: HeaderData | undefined = (headers as any)[key];

            if (!header) {
                this.logger.error(`There is no header specified for cell data key ${key}.`);
                return;
            }

            for (const d of data) {
                switch (d.type) {
                    case 'number':
                        sheet.cell(d.row, header.column).number(d.content);
                        break;
                    case 'string':
                    default:
                        sheet.cell(d.row, header.column).string(d.content);
                }
            }
        });
    }
}
