import { Type } from 'class-transformer';
import { HasId } from 'shared/model/Common';
import {
  convertExercisePointInfoToString,
  ExercisePointsInfo,
  IExercisePointsInfo,
} from 'shared/model/Gradings';
import { IExercise, ISubexercise } from 'shared/model/HasExercises';

export class Subexercise implements ISubexercise {
  id!: string;
  exName!: string;
  maxPoints!: number;
  bonus!: boolean;

  get pointInfo(): ExercisePointsInfo {
    return new ExercisePointsInfo({
      must: this.bonus ? 0 : this.maxPoints,
      bonus: this.bonus ? this.maxPoints : 0,
    });
  }
}

export class Exercise extends Subexercise implements IExercise {
  @Type(() => Subexercise)
  subexercises!: Subexercise[];

  /**
   * Total points of the exercise. If it has subexercises this is equal to the sum of their points
   */
  get points(): number {
    if (this.subexercises.length === 0) {
      return this.maxPoints;
    }

    return this.subexercises.reduce((sum, current) => sum + current.maxPoints, 0);
  }

  get pointInfo(): ExercisePointsInfo {
    if (this.subexercises.length === 0) {
      return new ExercisePointsInfo({
        must: this.bonus ? 0 : this.maxPoints,
        bonus: this.bonus ? this.maxPoints : 0,
      });
    }

    const info = this.subexercises.reduce(
      (prev, current) => {
        const currentInfo = current.pointInfo;

        return {
          must: prev.must + currentInfo.must,
          bonus: prev.bonus + currentInfo.bonus,
        };
      },
      { must: 0, bonus: 0 }
    );
    return new ExercisePointsInfo(info);
  }
}

export abstract class HasExercises implements HasId {
  readonly id!: string;

  @Type(() => Exercise)
  readonly exercises!: Exercise[];

  /**
   * Total points of the sheet. This is equal to the sum of the points of all exercises in this sheet.
   */
  get totalPoints(): number {
    return this.exercises.reduce((sum, current) => sum + current.points, 0);
  }

  /**
   * Information about the total points of this entity split into `must` and `bonus` points.
   */
  get pointInfo(): ExercisePointsInfo {
    const info = this.exercises.reduce<IExercisePointsInfo>(
      (prev, current) => {
        const { must, bonus } = current.pointInfo;

        return {
          must: prev.must + must,
          bonus: prev.bonus + bonus,
        };
      },
      { must: 0, bonus: 0 }
    );

    return new ExercisePointsInfo(info);
  }

  /**
   * @returns Information about the total points of the entity as a readable string.
   */
  getPointInfoAsString(): string {
    return convertExercisePointInfoToString(this.pointInfo);
  }

  /**
   * @returns A readable name of this object.
   */
  abstract toDisplayString(): string;
}
