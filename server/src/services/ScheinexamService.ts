import { DocumentNotFoundError } from '../model/Errors';
import { getIdOfDocumentRef } from '../helpers/documentHelpers';
import { ScheinExam, ScheinExamDTO } from 'shared/dist/model/Scheinexam';
import ScheinexamModel, { ScheinexamDocument } from '../model/documents/ScheinexamDocument';
import { convertDocumentToExercise } from '../model/documents/ExerciseDocument';

class ScheinExamService {
  public async getAllScheinExams(): Promise<ScheinExam[]> {
    throw new Error('[ScheinExamService] -- Not implemented yet.');
  }

  public async createScheinExam(dto: ScheinExamDTO): Promise<ScheinExam> {
    throw new Error('[ScheinExamService] -- Not implemented yet.');
  }

  public async updateScheinExam(id: string, dto: ScheinExamDTO): Promise<ScheinExam> {
    throw new Error('[ScheinExamService] -- Not implemented yet.');
  }

  public async deleteScheinExam(id: string): Promise<ScheinExam> {
    throw new Error('[ScheinExamService] -- Not implemented yet.');
  }

  public async getScheinExamWithId(id: string): Promise<ScheinExam> {
    const scheinexam: ScheinexamDocument | null = await this.getScheinExamDocumentWithId(id);

    return this.getScheinExamOrReject(scheinexam);
  }

  private async getScheinExamDocumentWithId(id: string): Promise<ScheinexamDocument> {
    const exam: ScheinexamDocument | null = await ScheinexamModel.findById(id);

    if (!exam) {
      return this.rejectScheinExamNotFound();
    }

    return exam;
  }

  private async getScheinExamOrReject(scheinexam: ScheinexamDocument | null): Promise<ScheinExam> {
    if (!scheinexam) {
      return this.rejectScheinExamNotFound();
    }

    const { _id, scheinExamNo, date, percentageNeeded, exercises } = scheinexam;

    return {
      id: _id,
      scheinExamNo,
      date,
      percentageNeeded,
      exercises: exercises.map(convertDocumentToExercise),
    };
  }

  private async rejectScheinExamNotFound(): Promise<any> {
    return Promise.reject(new DocumentNotFoundError('ScheinExam with that ID was not found.'));
  }
}

const scheinexamService = new ScheinExamService();

export default scheinexamService;
