import { Sheet, SheetDTO } from 'shared/dist/model/Sheet';
import { Student } from 'shared/dist/model/Student';
import {
  convertDocumentToExercise,
  ExerciseDocument,
  generateExerciseDocumentsFromDTOs,
} from '../../model/documents/ExerciseDocument';
import SheetModel, { SheetDocument } from '../../model/documents/SheetDocument';
import { DocumentNotFoundError } from '../../model/Errors';
import teamService from '../team-service/TeamService.class';
import { PointId, PointMap } from 'shared/dist/model/Points';

class SheetService {
  public async getAllSheets(): Promise<Sheet[]> {
    const sheetDocuments: SheetDocument[] = await SheetModel.find();
    const sheets: Sheet[] = [];

    for (const doc of sheetDocuments) {
      sheets.push(await this.getSheetOrReject(doc));
    }

    return sheets;
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

  public async getPointsOfStudent(student: Student, sheet: Sheet): Promise<number> {
    const pointsOfStudent = new PointMap(student.points);
    let pointsOfTeam = new PointMap();

    if (student.team) {
      const team = await teamService.getTeamWithId(student.tutorial, student.team.id);
      pointsOfTeam = new PointMap(team.points);
    }

    let result = 0;

    for (const exercise of sheet.exercises) {
      const pointId = new PointId(sheet.id, exercise);

      if (pointsOfStudent.has(pointId)) {
        result += pointsOfStudent.getPoints(pointId) || 0;
      } else if (pointsOfTeam.has(pointId)) {
        result += pointsOfTeam.getPoints(pointId) || 0;
      }
    }

    return result;
  }

  public getSheetTotalPoints(sheet: Sheet): number {
    return sheet.exercises.reduce(
      (points, exercise) => points + (exercise.bonus ? 0 : exercise.maxPoints),
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
