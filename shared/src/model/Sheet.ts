import { HasId } from './Common';

export interface Sheet extends HasId {
  bonusSheet: boolean;
  exercises: Exercise[];
  id: string;
  sheetNo: number;
}

export interface Exercise {
  bonus: boolean;
  exNo: number;
  maxPoints: number;
}

export interface SheetDTO {
  bonusSheet: boolean;
  exercises: ExerciseDTO[];
  sheetNo: number;
}

export interface ExerciseDTO {
  bonus: boolean;
  exNo: number;
  maxPoints: number;
}

export interface UpdatePointsDTO {
  exercises: { [index: string]: number };
  id: string;
}
