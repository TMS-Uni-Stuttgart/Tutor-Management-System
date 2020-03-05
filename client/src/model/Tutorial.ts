import { DateTime } from 'luxon';
import { Transform } from 'class-transformer';
import { Modify } from '../typings/Modify';
import { ITutorial } from '../../../server/src/shared/model/Tutorial';

interface Modified {
  dates: DateTime[];
  startTime: DateTime;
  endTime: DateTime;
  substitutes: Map<string, string>;
}

export class Tutorial implements Modify<ITutorial, Modified> {
  id!: string;
  slot!: string;
  tutor?: string;
  students!: string[];
  teams!: string[];
  correctors!: string[];

  @Transform(value => DateTime.fromISO(value), { toClassOnly: true })
  dates!: DateTime[];

  @Transform(value => DateTime.fromISO(value), { toClassOnly: true })
  startTime!: DateTime;

  @Transform(value => DateTime.fromISO(value), { toClassOnly: true })
  endTime!: DateTime;

  substitutes!: Map<string, string>;

  /**
   * Returns the ID of the substitute for the given date. If there is no substitute `undefined` is returned.
   *
   * @param date Date to get the substitute ID for.
   *
   * @returns ID of the substitute for the given date or `undefined`.
   */
  getSubstitute(date: DateTime): string | undefined {
    return this.substitutes.get(date.toISODate());
  }
}
