import { Sheet, SheetDTO } from 'shared/dist/model/Sheet';
import {
  convertDocumentToExercise,
  ExerciseDocument,
  generateExerciseDocumentsFromDTOs,
} from '../../model/documents/ExerciseDocument';
import SheetModel, { SheetDocument } from '../../model/documents/SheetDocument';
import { DocumentNotFoundError } from '../../model/Errors';

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
