import { IShortTest } from 'shared/model/ShortTest';
import { HasExercises } from './Exercise';

export class ShortTest extends HasExercises implements IShortTest {
  readonly shortTestNo!: number;
  readonly percentageNeeded!: number;

  toDisplayString(): string {
    return `Kurztest #${this.shortTestNo.toString(10).padStart(2, '0')}`;
  }
}
