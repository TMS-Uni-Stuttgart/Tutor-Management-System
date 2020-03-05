import { DateTime } from 'luxon';
import { Transform } from 'class-transformer';
import { Modify } from '../typings/Modify';
import { ITutorial, UserInEntity } from '../../../server/src/shared/model/Tutorial';
import { parseDateToMapKey } from '../util/helperFunctions';

interface Modified {
  dates: DateTime[];
  startTime: DateTime;
  endTime: DateTime;
  substitutes: Map<string, UserInEntity>;
}

export class Tutorial implements Modify<ITutorial, Modified> {
  id!: string;
  slot!: string;
  tutor?: UserInEntity;
  students!: string[];
  teams!: string[];
  correctors!: UserInEntity[];

  @Transform(value => DateTime.fromISO(value), { toClassOnly: true })
  dates!: DateTime[];

  @Transform(value => DateTime.fromISO(value), { toClassOnly: true })
  startTime!: DateTime;

  @Transform(value => DateTime.fromISO(value), { toClassOnly: true })
  endTime!: DateTime;

  substitutes!: Map<string, UserInEntity>;

  /**
   * Returns basic information of the substitute of the given date. If there is no substitute `undefined` is returned.
   *
   * @param date Date to get the substitute ID for.
   *
   * @returns Information of the substitute for the given date or `undefined`.
   */
  getSubstitute(date: DateTime): UserInEntity | undefined {
    return this.substitutes.get(parseDateToMapKey(date));
  }
}
