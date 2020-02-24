import { HasId } from './Common';
import { Exercise, IExerciseDTO } from './Sheet';

export interface ScheinExam extends HasId {
  date: Date;
  exercises: Exercise[];
  percentageNeeded: number;
  scheinExamNo: number;
}

export interface IScheinExamDTO {
  date: string;
  exercises: IExerciseDTO[];
  percentageNeeded: number;
  scheinExamNo: number;
}
