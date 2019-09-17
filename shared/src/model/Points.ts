import { Exercise } from './Sheet';

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

// /**
//  * Maps exercise identifier to the corresponding `PointMapEntry`.
//  *
//  * The string identifiers must be generated using a `PointId` object.
//  *
//  * The `PointMapEntry` contains a comment belonging to the exercise aswell as the points of the exercise. The later can either be:
//  * - a `number` if the exercise does NOT have subexercises
//  * - OR a map which maps the subexercise Id to the gained points of this subexercise.
//  */
// export type PointMap = {
//   [exercise: string]: PointMapEntry;
// };

export interface UpdatePointsDTO {
  exercises: PointMapDTO;
  id: string;
}

export type PointMapDTO = {
  [exercise: string]: PointMapEntry | undefined;
};

export class PointMap {
  static fromDTO(dto: PointMapDTO): PointMap {
    return new PointMap(dto);
  }

  private points: PointMapDTO;

  constructor(dto: PointMapDTO = {}) {
    this.points = dto;
  }

  setPoints(pointId: PointId, points: PointMapEntry) {
    this.points[pointId.toString()] = points;
  }

  getPoints(pointId: PointId): PointMapEntry | undefined {
    return this.points[pointId.toString()];
  }

  getEntries(): [string, PointMapEntry][] {
    const entries: [string, PointMapEntry][] = [];

    Object.entries(this.points).forEach(([key, entry]) => {
      if (!!entry) {
        entries.push([key, entry]);
      }
    });

    return entries;
  }

  toDTO(): PointMapDTO {
    // TODO: Deep copy!
    return { ...this.points };
  }
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
