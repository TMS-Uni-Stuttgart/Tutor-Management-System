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
  bonus: boolean;
  exName: string;
  maxPoints: number;
  subexercises: ExerciseDTO[];
}

export interface UpdatePointsDTO {
  exercises: { [index: string]: number };
  id: string;
}

export class PointId {
  private exerciseIdentifier: string;

  readonly sheetId: string;

  constructor(sheetId: string, exercise: Exercise) {
    this.sheetId = sheetId;
    this.exerciseIdentifier = exercise.exName;
  }

  public toString(): string {
    return `ID::${this.sheetId}--Ex::${this.exerciseIdentifier}`;
  }
}
