import { HasId } from './Common';
import { Exercise, ExerciseDTO } from './Sheet';

export interface ScheinExam extends HasId {
  date: Date;
  exercises: Exercise[];
  percentageNeeded: number;
  scheinExamNo: number;
}

export interface ScheinExamDTO {
  date: string;
  exercises: ExerciseDTO[];
  percentageNeeded: number;
  scheinExamNo: number;
}
