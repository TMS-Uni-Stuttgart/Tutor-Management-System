import { Injectable, Logger } from '@nestjs/common';
import xl, { Workbook, Worksheet } from 'excel4node';
import { parse } from 'papaparse';
import { SheetDocument } from '../../database/models/sheet.model';
import { populateStudentDocument, StudentDocument } from '../../database/models/student.model';
import { TutorialDocument } from '../../database/models/tutorial.model';
import { AttendanceState } from '../../shared/model/Attendance';
import { ParseCsvResult } from '../../shared/model/CSV';
import { SheetService } from '../sheet/sheet.service';
import { TutorialService } from '../tutorial/tutorial.service';
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

@Injectable()
export class ExcelService {
  private readonly logger = new Logger(ExcelService.name);

  constructor(
    private readonly tutorialService: TutorialService,
    private readonly sheetService: SheetService
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
    const workbook = new xl.Workbook();

    sheets.sort((a, b) => a.sheetNo - b.sheetNo);

    this.createMemberWorksheet(workbook, tutorial.students);
    this.createAttendanceWorksheet(workbook, tutorial, tutorial.students);

    for (const sheet of sheets) {
      await this.createWorksheetForExerciseSheet(workbook, sheet, tutorial.students);
    }

    return workbook.writeToBuffer();
  }

  /**
   * Parses the given CSV string with the given options.
   *
   * Internally the papaparser is used to parse the string. If parsing fails the results papaparser result is still returned but it will be in it's errornous state.
   *
   * @param dto DTO with the CSV string to parse and the options to use.
   *
   * @returns Parsed results from papaparser.
   */
  async parseCSV(dto: ParseCsvDTO): Promise<ParseCsvResult<unknown>> {
    const { data, options } = dto;

    return parse(data, options);
  }

  private createMemberWorksheet(workbook: Workbook, students: StudentDocument[]) {
    const overviewSheet = workbook.addWorksheet('Teilnehmer');
    const headers: HeaderDataCollection<MemberKeys> = {
      firstname: {
        name: 'Vorname',
        column: 1,
      },
      lastname: {
        name: 'Nachname',
        column: 2,
      },
      status: {
        name: 'Status',
        column: 3,
      },
      matriculationNo: {
        name: 'Matrklnr.',
        column: 4,
      },
      courseOfStudies: {
        name: 'Studiengang',
        column: 5,
      },
      email: {
        name: 'E-Mail',
        column: 6,
      },
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
      cellData['matriculationNo'].push({ content: matriculationNo || 'N/A', row });
      cellData['courseOfStudies'].push({ content: courseOfStudies || 'N/A', row });
      cellData['email'].push({ content: email || 'N/A', row });

      row++;
    }

    this.fillSheet(overviewSheet, headers, cellData);
  }

  private async createWorksheetForExerciseSheet(
    workbook: Workbook,
    sheet: SheetDocument,
    students: StudentDocument[]
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
        name: `Aufgabe ${ex.exName}`,
        column,
      };
      data[ex.id] = [];
      column++;

      let row = 2;
      for (const student of students) {
        await populateStudentDocument(student);
        const grading = student.getGrading(sheet)?.getExerciseGrading(ex);

        data['firstname'].push({
          content: student.firstname,
          row,
        });

        data['lastname'].push({
          content: student.lastname,
          row,
        });

        if (!!grading) {
          data[ex.id].push({ content: grading.points, type: 'number', row });
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

  private createAttendanceWorksheet(
    workbook: Workbook,
    tutorial: TutorialDocument,
    students: StudentDocument[]
  ) {
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
