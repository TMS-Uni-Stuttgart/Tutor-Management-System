import { HasId } from './Common';

export interface HasExercises extends HasId {
  exercises: IExercise[];
}

export interface ISheet extends HasExercises {
  bonusSheet: boolean;
  exercises: IExercise[];
  sheetNo: number;
}

export interface ISubexercise extends HasId {
  bonus: boolean;
  exName: string;
  maxPoints: number;
}

export interface IExercise extends ISubexercise {
  subexercises: ISubexercise[];
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
