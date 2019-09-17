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

  getPointEntry(pointId: PointId): PointMapEntry | undefined {
    return this.points[pointId.toString()];
  }

  adjustPoints({ id, exercises }: HasExercises, pointsGained: PointMap) {
    for (const [exName, pointEntry] of pointsGained.getEntries()) {
      const exercise = exercises.find(ex => ex.exName === exName);

      if (exercise) {
        const pointId = new PointId(id, exercise);
        this.setPoints(pointId, pointEntry);
      }
    }
  }

  getPoints(pointId: PointId): number | undefined {
    const pointEntry = this.getPointEntry(pointId);

    if (!pointEntry) {
      return undefined;
    }

    return this.getPointsOfEntry(pointEntry);
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
    return { ...this.points };
  }

  private getPointsOfEntry(entry: PointMapEntry): number {
    if (typeof entry.points === 'number') {
      return entry.points;
    }

    return Object.values(entry.points).reduce((sum, pts) => sum + pts, 0);
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
