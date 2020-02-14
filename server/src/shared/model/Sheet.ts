import { HasId } from './Common';

export interface HasExercises extends HasId {
  exercises: Exercise[];
}

export interface Sheet extends HasExercises {
  bonusSheet: boolean;
  exercises: Exercise[];
  id: string;
  sheetNo: number;
}

export interface Exercise extends HasId {
  bonus: boolean;
  exName: string;
  maxPoints: number;
  subexercises: Exercise[];
}

export interface SheetDTO {
  bonusSheet: boolean;
  exercises: ExerciseDTO[];
  sheetNo: number;
}

export interface ExerciseDTO {
  id?: string;
  bonus: boolean;
  exName: string;
  maxPoints: number;
  subexercises: ExerciseDTO[];
}
