import { ScheinExam, ScheinExamDTO } from 'shared/dist/model/Scheinexam';
import {
  convertDocumentToExercise,
  ExerciseDocument,
  generateExerciseDocumentsFromDTOs,
} from '../../model/documents/ExerciseDocument';
import ScheinexamModel, { ScheinexamDocument } from '../../model/documents/ScheinexamDocument';
import { DocumentNotFoundError } from '../../model/Errors';
import { Student } from 'shared/dist/model/Student';
import { PointId, PointMap, getPointsOfExercise } from 'shared/dist/model/Points';

class ScheinExamService {
  public async getAllScheinExams(): Promise<ScheinExam[]> {
    const examDocuments: ScheinexamDocument[] = await ScheinexamModel.find();
    const exams: ScheinExam[] = [];

    for (const doc of examDocuments) {
      exams.push(await this.getScheinExamOrReject(doc));
    }

    return exams;
  }

  public async createScheinExam({
    scheinExamNo,
    date,
    exercises: exDTOs,
    percentageNeeded,
  }: ScheinExamDTO): Promise<ScheinExam> {
    const exercises: ExerciseDocument[] = generateExerciseDocumentsFromDTOs(exDTOs);

    const createdExam = await ScheinexamModel.create({
      scheinExamNo,
      date,
      exercises,
      percentageNeeded,
    });

    return this.getScheinExamOrReject(createdExam);
  }

  public async updateScheinExam(
    id: string,
    { scheinExamNo, date, exercises: exDTOs, percentageNeeded }: ScheinExamDTO
  ): Promise<ScheinExam> {
    const exam = await this.getDocumentWithId(id);
    const exercises: ExerciseDocument[] = generateExerciseDocumentsFromDTOs(exDTOs);

    exam.scheinExamNo = scheinExamNo;
    exam.date = new Date(date);
    exam.exercises = exercises;
    exam.percentageNeeded = percentageNeeded;

    return this.getScheinExamOrReject(await exam.save());
  }

  public async deleteScheinExam(id: string): Promise<ScheinExam> {
    const exam = await this.getDocumentWithId(id);

    return this.getScheinExamOrReject(await exam.remove());
  }

  public async getScheinExamWithId(id: string): Promise<ScheinExam> {
    const scheinexam: ScheinexamDocument | null = await this.getDocumentWithId(id);

    return this.getScheinExamOrReject(scheinexam);
  }

  public async getDocumentWithId(id: string): Promise<ScheinexamDocument> {
    const exam: ScheinexamDocument | null = await ScheinexamModel.findById(id);

    if (!exam) {
      return this.rejectScheinExamNotFound();
    }

    return exam;
  }

  public async doesScheinexamWithIdExist(id: string): Promise<boolean> {
    const exam: ScheinexamDocument | null = await ScheinexamModel.findById(id);

    return !!exam;
  }

  public getScheinExamResult(student: Student, exam: ScheinExam): number {
    const pointsOfStudent = new PointMap(student.points);
    let result = 0;

    exam.exercises.forEach(exercise => {
      const pointId = new PointId(exam.id, exercise);
      result += pointsOfStudent.getPoints(pointId) || 0;
    });

    return result;
  }

  public getScheinExamTotalPoints(exam: ScheinExam): number {
    return exam.exercises.reduce(
      (points, exercise) => points + getPointsOfExercise(exercise).must,
      0
    );
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
