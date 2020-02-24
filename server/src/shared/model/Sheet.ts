import { HasId } from './Common';

export interface HasExercises extends HasId {
  exercises: Exercise[];
}

export interface Sheet extends HasExercises {
  bonusSheet: boolean;
  exercises: Exercise[];
  sheetNo: number;
}

export interface Subexercise extends HasId {
  bonus: boolean;
  exName: string;
  maxPoints: number;
}

export interface Exercise extends Subexercise {
  subexercises: Subexercise[];
}

export interface ISheetDTO {
  bonusSheet: boolean;
  exercises: IExerciseDTO[];
  sheetNo: number;
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
