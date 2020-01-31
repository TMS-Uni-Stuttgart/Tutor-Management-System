import { getPointsOfExercise, PointId, PointMap } from 'shared/dist/model/Points';
import { Sheet, SheetDTO } from 'shared/dist/model/Sheet';
import {
  convertDocumentToExercise,
  ExerciseDocument,
  generateExerciseDocumentsFromDTOs,
} from '../../model/documents/ExerciseDocument';
import SheetModel, { SheetDocument } from '../../model/documents/SheetDocument';
import { StudentDocument } from '../../model/documents/StudentDocument';
import { DocumentNotFoundError } from '../../model/Errors';

class SheetService {
  public async getAllSheets(): Promise<Sheet[]> {
    const sheetDocuments = await this.getAllSheetsAsDocuments();
    const sheets: Promise<Sheet>[] = [];

    for (const doc of sheetDocuments) {
      sheets.push(this.getSheetOrReject(doc));
    }

    return Promise.all(sheets);
  }

  public async getAllSheetsAsDocuments(): Promise<SheetDocument[]> {
    const sheetDocuments: SheetDocument[] = await SheetModel.find();

    return sheetDocuments;
  }

  public async createSheet({ sheetNo, exercises: exDTOs, bonusSheet }: SheetDTO): Promise<Sheet> {
    const exercises: ExerciseDocument[] = generateExerciseDocumentsFromDTOs(exDTOs, bonusSheet);

    const createdSheet = await SheetModel.create({ sheetNo, bonusSheet, exercises });

    return this.getSheetOrReject(createdSheet);
  }

  public async updateSheet(
    id: string,
    { sheetNo, exercises: exDTOs, bonusSheet }: SheetDTO
  ): Promise<Sheet> {
    const sheet: SheetDocument = await this.getDocumentWithId(id);
    const exercises: ExerciseDocument[] = generateExerciseDocumentsFromDTOs(exDTOs, bonusSheet);

    sheet.sheetNo = sheetNo;
    sheet.bonusSheet = bonusSheet;
    sheet.exercises = exercises;

    return this.getSheetOrReject(await sheet.save());
  }

  public async deleteSheet(id: string): Promise<Sheet> {
    const sheet: SheetDocument = await this.getDocumentWithId(id);

    return this.getSheetOrReject(await sheet.remove());
  }

  public async getSheetWithId(id: string): Promise<Sheet> {
    const sheet: SheetDocument | null = await this.getDocumentWithId(id);

    return this.getSheetOrReject(sheet);
  }

  public async getDocumentWithId(id: string): Promise<SheetDocument> {
    const sheet: SheetDocument | null = await SheetModel.findById(id);

    if (!sheet) {
      return this.rejectSheetNotFound();
    }

    return sheet;
  }

  public async doesSheetWithIdExist(id: string): Promise<boolean> {
    const sheet: SheetDocument | null = await SheetModel.findById(id);

    return !!sheet;
  }

  public getPointsOfStudent(student: StudentDocument, sheet: Sheet): number {
    const pointsOfStudent = new PointMap(student.points);
    let pointsOfTeam = new PointMap();

    if (student.teamDocument) {
      pointsOfTeam = new PointMap(student.teamDocument.points);
    }

    let result = 0;

    for (const exercise of sheet.exercises) {
      const pointId = new PointId(sheet.id, exercise);

      if (pointsOfStudent.hasPointEntry(pointId)) {
        result += pointsOfStudent.getPoints(pointId) || 0;
      } else if (pointsOfTeam.hasPointEntry(pointId)) {
        result += pointsOfTeam.getPoints(pointId) || 0;
      }
    }

    return result;
  }

  public getSheetTotalPoints(sheet: Sheet): number {
    return sheet.exercises.reduce(
      (points, exercise) => points + getPointsOfExercise(exercise).must,
      0
    );
  }

  private async getSheetOrReject(sheet: SheetDocument | null): Promise<Sheet> {
    if (!sheet) {
      return this.rejectSheetNotFound();
    }

    const { _id, sheetNo, bonusSheet, exercises } = sheet;

    return {
      id: _id,
      sheetNo,
      bonusSheet,
      exercises: exercises.map(convertDocumentToExercise),
    };
  }

  public async rejectSheetNotFound(): Promise<any> {
    return Promise.reject(new DocumentNotFoundError('Sheet with that ID was not found.'));
  }
}

const sheetService = new SheetService();

export default sheetService;
