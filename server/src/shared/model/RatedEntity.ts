import { HasId } from './Common';
import { IExercise, IHasExercisesDTO } from './HasExercises';

export interface IRatedEntity extends HasId {
  exercises: IExercise[];
  percentageNeeded: number;
}

export interface IRatedEntityDTO extends IHasExercisesDTO {
  percentageNeeded: number;
}
