import { HasId } from './Common';
import { IExercise, IExerciseDTO } from './Sheet';

export interface IRatedEntity extends HasId {
  exercises: IExercise[];
  percentageNeeded: number;
}

export interface IRatedEntityDTO {
  exercises: IExerciseDTO[];
  percentageNeeded: number;
}
