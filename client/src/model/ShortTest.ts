import { IShortTest } from 'shared/model/ShortTest';
import { HasExercises } from './Exercise';

export class ShortTest extends HasExercises implements IShortTest {
  readonly shortTestNo!: string;
  readonly percentageNeeded!: number;

  toDisplayString(): string {
    return `Kurztest #${this.shortTestNo.padStart(2, '0')}`;
  }
}
