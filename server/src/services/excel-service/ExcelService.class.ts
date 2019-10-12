import { isDocument } from '@hasezoey/typegoose';
import xl, { Workbook, Worksheet } from 'excel4node';
import Logger from '../../helpers/Logger';
import { TutorialDocument } from '../../model/documents/TutorialDocument';
import tutorialService from '../tutorial-service/TutorialService.class';
import { SheetDocument } from '../../model/documents/SheetDocument';
import sheetService from '../sheet-service/SheetService.class';
import { Sheet } from 'shared/dist/model/Sheet';
import { StudentDocument } from '../../model/documents/StudentDocument';
import { getIdOfDocumentRef } from '../../helpers/documentHelpers';
import { PointId } from 'shared/dist/model/Points';

interface HeaderData {
  name: string;
  column: number;
}

interface CellData {
  content: string;
  row: number;
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

    for (const sheet of sheets) {
      await this.createWorksheetForExerciseSheet(workbook, sheet, students);
    }

    // TODO: Add sheet with attendances of students (by date as headers).

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
    // this.fillHeaders(overviewSheet, [
    //   'Vorname',
    //   'Name',
    //   'Status',
    //   'Matrklnr.',
    //   'Studiengang',
    //   'E-Mail',
    // ]);
    // currentRow++;

    let row = 2;
    for (const student of students) {
      const { firstname, lastname, matriculationNo, courseOfStudies, email } = student;
      cellData['firstname'].push({ content: firstname, row });
      cellData['lastname'].push({ content: lastname, row });
      cellData['matriculationNo'].push({ content: matriculationNo, row });
      cellData['courseOfStudies'].push({ content: courseOfStudies || 'N/A', row });
      cellData['email'].push({ content: email || 'N/A', row });

      // this.fillRow(overviewSheet, row, [
      //   firstname,
      //   lastname,
      //   'N/A',
      //   matriculationNo,
      //   courseOfStudies || 'N/A',
      //   email || 'N/A',
      // ]);

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
    let column = 4;

    for (const ex of sheet.exercises) {
      headers[ex.id] = {
        name: `Aufgabe ${ex.exName}`,
        column,
      };
      column++;

      // TODO: Add points of exercises
      // TODO: Add presentation points
    }

    this.fillSheet(worksheet, headers, {});
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
        sheet.cell(d.row, header.column).string(d.content);
      }
    });
  }
}

const excelService = new ExcelService();

export default excelService;
