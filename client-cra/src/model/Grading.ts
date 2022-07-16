import { Transform, Type } from 'class-transformer';
import { IExerciseGrading, IGrading } from 'shared/model/Gradings';
import { Modify } from '../typings/Modify';
import { Exercise, Subexercise } from './Exercise';

interface Modified {
  exerciseGradings: Map<string, ExerciseGrading>;
}

interface ExerciseModified {
  subExercisePoints?: Map<string, number>;
}

export class ExerciseGrading implements Modify<IExerciseGrading, ExerciseModified> {
  readonly points!: number;
  readonly comment?: string;
  readonly additionalPoints?: number;

  @Transform(({ value }) => new Map(value))
  readonly subExercisePoints?: Map<string, number>;

  /**
   * The sum of all points achieved in the exercise (or the subexercises) plus the `additionalPoints` (if there are any).
   */
  get totalPoints(): number {
    const addPoints = this.additionalPoints ?? 0;

    if (!this.subExercisePoints) {
      return this.points + addPoints;
    }

    let sum = 0;

    this.subExercisePoints.forEach((value) => {
      sum += value;
    });

    return sum + addPoints;
  }

  /**
   * Returns the grading for the given exercise if there is any. If there is none `undefined` is returned.
   *
   * @param exercise Subexercise to get the grading for.
   *
   * @returns Achieved points in the subexercise or `undefined`.
   */
  getGradingForSubexercise(subExercise: Subexercise): number | undefined {
    if (!this.subExercisePoints) {
      return undefined;
    }

    return this.subExercisePoints.get(subExercise.id);
  }
}

export class Grading implements Modify<IGrading, Modified> {
  readonly id!: string;
  readonly points!: number;
  readonly belongsToTeam!: boolean;
  readonly comment?: string;
  readonly additionalPoints?: number;

  @Type(() => ExerciseGrading)
  @Transform(({ value }) => new Map(value))
  readonly exerciseGradings!: Map<string, ExerciseGrading>;

  /**
   * The sum of all points achieved in the exercises plus the `additionalPoints` (if there are any).
   */
  get totalPoints(): number {
    let sum = this.additionalPoints ?? 0;

    for (const [, doc] of this.exerciseGradings) {
      sum += doc.points;
    }

    return sum;
  }

  /**
   * Returns the ExerciseGrading for the given exercise if there is any. If there is none `undefined` is returned.
   *
   * @param exercise Exercise to get the grading for.
   *
   * @returns ExerciseGrading or `undefined`.
   */
  getExerciseGrading(exercise: Exercise): ExerciseGrading | undefined {
    return this.exerciseGradings.get(exercise.id);
  }
}
