import { Transform } from 'class-transformer';
import { DateTime } from 'luxon';
import { IScheinExam } from '../../../server/src/shared/model/Scheinexam';
import { Modify } from '../typings/Modify';
import { HasExercises } from './Exercise';

interface Modified {
  date: DateTime;
}

export class Scheinexam extends HasExercises implements Modify<IScheinExam, Modified> {
  id!: string;
  scheinExamNo!: number;
  percentageNeeded!: number;

  @Transform(value => DateTime.fromISO(value))
  date!: DateTime;
}
