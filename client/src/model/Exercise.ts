import { Type } from 'class-transformer';
import { IExercise, ISubexercise } from '../../../server/src/shared/model/Sheet';

export class Subexercise implements ISubexercise {
  id!: string;
  exName!: string;
  maxPoints!: number;
  bonus!: boolean;
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
}
