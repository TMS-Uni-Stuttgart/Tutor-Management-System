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

export interface Exercise {
  bonus: boolean;
  exNo: number;
  maxPoints: number;
  subexercises: Exercise[];
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
  subexercises: ExerciseDTO[];
}

export interface UpdatePointsDTO {
  exercises: { [index: string]: number };
  id: string;
}

export class PointId {
  constructor(readonly sheetId: string, readonly exerciseNo: number) {}

  public toString(): string {
    return `ID::${this.sheetId}--Ex::${this.exerciseNo}`;
  }
}
