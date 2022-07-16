import { Transform } from 'class-transformer';
import { DateTime } from 'luxon';
import { IScheinExam } from 'shared/model/Scheinexam';
import { Modify } from '../typings/Modify';
import { HasExercises } from './Exercise';

interface Modified {
  date: DateTime;
}

export class Scheinexam extends HasExercises implements Modify<IScheinExam, Modified> {
  readonly id!: string;
  readonly scheinExamNo!: number;
  readonly percentageNeeded!: number;

  @Transform(({ value }) => DateTime.fromISO(value))
  readonly date!: DateTime;

  toDisplayString(): string {
    return `Scheinklausur #${this.scheinExamNo} (${this.date.toLocaleString(DateTime.DATE_MED)})`;
  }
}
