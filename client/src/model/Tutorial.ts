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
  readonly id!: string;
  readonly slot!: string;
  readonly tutor?: UserInEntity;
  readonly students!: string[];
  readonly teams!: string[];
  readonly correctors!: UserInEntity[];

  @Transform((values: string[]) => values.map(val => DateTime.fromISO(val)), { toClassOnly: true })
  readonly dates!: DateTime[];

  @Transform(value => DateTime.fromISO(value), { toClassOnly: true })
  readonly startTime!: DateTime;

  @Transform(value => DateTime.fromISO(value), { toClassOnly: true })
  readonly endTime!: DateTime;

  @Transform(value => new Map(value))
  readonly substitutes!: Map<string, UserInEntity>;

  static getDisplayString(hasSlot: { slot: string }) {
    return `Tutorium ${hasSlot.slot.padStart(2, '0')}`;
  }

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

  toDisplayString(): string {
    return Tutorial.getDisplayString(this);
  }
}
