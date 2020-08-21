import { HasId } from './Common';

export interface ISubexercise extends HasId {
  bonus: boolean;
  exName: string;
  maxPoints: number;
}

export interface IExercise extends ISubexercise {
  subexercises: ISubexercise[];
}

export interface IHasExercises extends HasId {
  exercises: IExercise[];
}

export interface IHasExercisesDTO {
  exercises: IExerciseDTO[];
}

export interface ISubexerciseDTO {
  id?: string;
  bonus: boolean;
  exName: string;
  maxPoints: number;
}

export interface IExerciseDTO extends ISubexerciseDTO {
  subexercises?: ISubexerciseDTO[];
}
