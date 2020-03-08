import { HasId } from './Common';
import { IExercise, IExerciseDTO } from './Sheet';

export interface IScheinExam extends HasId {
  date: string;
  exercises: IExercise[];
  percentageNeeded: number;
  scheinExamNo: number;
}

export interface IScheinexamDTO {
  date: string;
  exercises: IExerciseDTO[];
  percentageNeeded: number;
  scheinExamNo: number;
}
