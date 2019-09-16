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
  bonus: boolean;
  exName: string;
  maxPoints: number;
  subexercises: ExerciseDTO[];
}

export type PointsOfSubexercises = {
  [subExId: string]: number;
};

/**
 * Entry of a `PointMap`.
 *
 * It contains a comment aswell as the gained points of an exercise. These can either be:
 * - a `number` if the exercise does NOT have subexercises
 * - OR a map which maps the subexercise Id to the gained points of this subexercise.
 */
export interface PointMapEntry {
  comment: string;
  points: number | PointsOfSubexercises;
}

/**
 * Maps exercise identifier to the corresponding `PointMapEntry`.
 *
 * The string identifiers must be generated using a `PointId` object.
 *
 * The `PointMapEntry` contains a comment belonging to the exercise aswell as the points of the exercise. The later can either be:
 * - a `number` if the exercise does NOT have subexercises
 * - OR a map which maps the subexercise Id to the gained points of this subexercise.
 */
export type PointMap = {
  [exercise: string]: PointMapEntry;
};

export interface UpdatePointsDTO {
  exercises: PointMap;
  id: string;
}

export class PointId {
  private exerciseIdentifier: string;

  readonly sheetId: string;

  constructor(sheetId: string, exercise: Exercise) {
    this.sheetId = sheetId;
    this.exerciseIdentifier = exercise.id;
  }

  public toString(): string {
    return `ID::${this.sheetId}--Ex::${this.exerciseIdentifier}`;
  }
}

// FIXME: Does NOT handle bonus points.
export function getPointsOfExercise(exercise: Exercise): number {
  if (exercise.subexercises.length === 0) {
    return exercise.maxPoints;
  }

  return exercise.subexercises.reduce((pts, subEx) => {
    return pts + getPointsOfExercise(subEx);
  }, 0);
}
