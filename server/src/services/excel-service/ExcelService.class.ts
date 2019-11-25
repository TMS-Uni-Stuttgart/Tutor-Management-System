import { isDocument } from '@hasezoey/typegoose';
import xl, { Workbook, Worksheet } from 'excel4node';
import { PointId, PointMap } from 'shared/dist/model/Points';
import { Sheet } from 'shared/dist/model/Sheet';
import { getIdOfDocumentRef } from '../../helpers/documentHelpers';
import Logger from '../../helpers/Logger';
import { StudentDocument } from '../../model/documents/StudentDocument';
import sheetService from '../sheet-service/SheetService.class';
import tutorialService from '../tutorial-service/TutorialService.class';
import { TutorialDocument } from '../../model/documents/TutorialDocument';
import { AttendanceState } from 'shared/dist/model/Attendance';
import { utcToZonedTime } from 'date-fns-tz';

interface HeaderData {
  name: string;
  column: number;
}

interface CellData {
  // TODO: Better typesafety regarding the actual type?
  content: any;
  row: number;
  type?: 'string' | 'number';
}

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

class ExcelService {
  public async generateXLSXForTutorial(tutorialId: string): Promise<Buffer> {
    const tutorial = await tutorialService.getDocumentWithID(tutorialId);
    const sheets = await sheetService.getAllSheets();
    const workbook = new xl.Workbook();
    const students: StudentDocument[] = [];

    await tutorial.populate('students').execPopulate();

    tutorial.students.forEach(student => {
      if (!isDocument(student)) {
        // Due to the population this should never be hit!
        Logger.error(
          `Student ${getIdOfDocumentRef(student)} is not a document but it should be one.`
        );
        return;
      }

      students.push(student);
    });

    sheets.sort((a, b) => a.sheetNo - b.sheetNo);

    this.createMemberWorksheet(workbook, students);
    this.createAttendanceWorksheet(workbook, tutorial, students);

    for (const sheet of sheets) {
      await this.createWorksheetForExerciseSheet(workbook, sheet, students);
    }

    return workbook.writeToBuffer();
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
      cellData['matriculationNo'].push({ content: matriculationNo, row });
      cellData['courseOfStudies'].push({ content: courseOfStudies || 'N/A', row });
      cellData['email'].push({ content: email || 'N/A', row });

      row++;
    }

    this.fillSheet(overviewSheet, headers, cellData);
  }

  private async createWorksheetForExerciseSheet(
    workbook: Workbook,
    sheet: Sheet,
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
      const pointId = new PointId(sheet.id, ex);

      headers[ex.id] = {
        name: `Aufgabe ${ex.exName}`,
        column,
      };
      data[ex.id] = [];
      column++;

      let row = 2;
      for (const student of students) {
        const entry = await student.getPointEntry(pointId);

        data['firstname'].push({
          content: student.firstname,
          row,
        });

        data['lastname'].push({
          content: student.lastname,
          row,
        });

        data[ex.id].push({
          content: entry ? PointMap.getPointsOfEntry(entry) : 'N/A',
          type: entry ? 'number' : 'string',
          row,
        });

        data['presentation'].push({
          content: student.getPresentationPointsOfSheet(sheet),
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
      // FIXME: Remove this hotfix after fixing all date related stuff (probably in v2).
      const parsedDate = utcToZonedTime(date, 'Europe/Berlin');
      const dateKey = parsedDate.toISOString();

      headers[dateKey] = {
        name: parsedDate.toDateString(),
        column,
      };
      data[dateKey] = [];

      let row = 2;
      for (const student of students) {
        const attendance = student.getAttendanceOfDay(parsedDate);
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
            content: attendance.state || AttendanceState.UNEXCUSED,
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
        Logger.error(`There is no header specified for cell data key ${key}.`);
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

const excelService = new ExcelService();

export default excelService;
