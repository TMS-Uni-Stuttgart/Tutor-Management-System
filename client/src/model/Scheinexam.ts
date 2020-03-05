import { Transform, Type } from 'class-transformer';
import { DateTime } from 'luxon';
import { IScheinExam } from '../../../server/src/shared/model/Scheinexam';
import { Modify } from '../typings/Modify';
import { Exercise } from './Exercise';

interface Modified {
  date: DateTime;
}

export class Scheinexam implements Modify<IScheinExam, Modified> {
  id!: string;
  scheinExamNo!: number;
  percentageNeeded!: number;

  @Transform(value => DateTime.fromISO(value))
  date!: DateTime;

  @Type(() => Exercise)
  exercises!: Exercise[];
}
