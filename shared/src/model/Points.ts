import { Exercise, HasExercises } from './Sheet';

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

export interface UpdatePointsDTO {
  exercises: PointMapDTO;
  id: string;
}

export type PointMapDTO = {
  [exercise: string]: PointMapEntry | undefined;
};

export class PointId {
  private readonly exerciseIdentifier: string;
  private readonly sheetId: string;

  constructor(sheetId: string, exercise: Exercise) {
    this.sheetId = sheetId;
    this.exerciseIdentifier = exercise.id;
  }

  public toString(): string {
    return `ID::${this.sheetId}--Ex::${this.exerciseIdentifier}`;
  }
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
export class PointMap {
  static fromDTO(dto: PointMapDTO): PointMap {
    return new PointMap(dto);
  }

  static arePointMapEntriesEqual(first: PointMapEntry, second: PointMapEntry): boolean {
    if (first.comment !== second.comment) {
      return false;
    }

    // If one of the points is number just check the numbers.
    if (typeof first.points === 'number' || typeof second.points === 'number') {
      return first.points === second.points;
    }

    // Both points are objects so compare all of their entries.
    if (Object.entries(first.points).length !== Object.entries(second.points).length) {
      return false;
    }

    for (const [key, value] of Object.entries(first.points)) {
      if (value !== second.points[key]) {
        return false;
      }
    }

    return true;
  }

  static getPointsOfEntry(entry: PointMapEntry): number {
    if (typeof entry.points === 'number') {
      return entry.points;
    }

    return Object.values(entry.points).reduce((sum, pts) => sum + pts, 0);
  }

  private points: PointMapDTO;

  constructor(dto: PointMapDTO = {}) {
    this.points = dto;
  }

  setPoints(pointId: PointId, points: PointMapEntry) {
    this.setPointsByKey(pointId.toString(), points);
  }

  setPointsByKey(key: string, points: PointMapEntry) {
    this.points[key] = points;
  }

  getPointEntry(id: string | PointId): PointMapEntry | undefined {
    const key = id instanceof PointId ? id.toString() : id;

    return this.points[key];
  }

  adjustPoints(pointsGained: PointMap) {
    pointsGained.getEntries().forEach(([key, entry]) => {
      this.setPointsByKey(key, entry);
    });
  }

  getPoints(pointId: PointId): number | undefined {
    const pointEntry = this.getPointEntry(pointId);

    if (!pointEntry) {
      return undefined;
    }

    return PointMap.getPointsOfEntry(pointEntry);
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

  getSumOfPoints({ id, exercises }: HasExercises): number {
    return exercises.reduce((sum, ex) => {
      const pts = this.getPoints(new PointId(id, ex)) || 0;

      return sum + pts;
    }, 0);
  }

  has(id: string | PointId): boolean {
    const key = id instanceof PointId ? id.toString() : id;

    return !!this.points[key];
  }

  isEmpty(): boolean {
    return Object.entries(this.points).length === 0;
  }

  toDTO(): PointMapDTO {
    // TODO: Deep copy!
    return this.points;
  }
}

export type ExercisePointInfo = { must: number; bonus: number };

export function convertExercisePointInfoToString(exPointInfo: ExercisePointInfo): string {
  if (exPointInfo.must > 0 && exPointInfo.bonus > 0) {
    return `${exPointInfo.must} + ${exPointInfo.bonus}`;
  } else if (exPointInfo.bonus === 0) {
    return `${exPointInfo.must}`;
  } else {
    return `${exPointInfo.bonus} Bonus`;
  }
  // return exPointInfo.bonus ? `${exPointInfo.must} + ${exPointInfo.bonus}` : `${exPointInfo.must}`;
}

export function getPointsOfExercise(exercise: Exercise): ExercisePointInfo {
  const points: ExercisePointInfo = { must: 0, bonus: 0 };

  if (exercise.subexercises.length === 0) {
    if (exercise.bonus) {
      return { must: 0, bonus: exercise.maxPoints };
    } else {
      return { must: exercise.maxPoints, bonus: 0 };
    }
  }

  return exercise.subexercises.reduce((pts, subEx) => {
    if (subEx.bonus) {
      return { ...pts, bonus: pts.bonus + subEx.maxPoints };
    } else {
      return { ...pts, must: pts.must + subEx.maxPoints };
    }
  }, points);
}

export function getPointsOfAllExercises({ exercises }: HasExercises): ExercisePointInfo {
  return exercises.reduce(
    (pts, ex) => {
      const { must, bonus } = getPointsOfExercise(ex);

      return { must: pts.must + must, bonus: pts.bonus + bonus };
    },
    { must: 0, bonus: 0 }
  );
}
