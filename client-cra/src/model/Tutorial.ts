import { Transform } from 'class-transformer';
import { DateTime } from 'luxon';
import { ITutorial, UserInEntity } from 'shared/model/Tutorial';
import { Modify } from '../typings/Modify';
import { parseDateToMapKey } from '../util/helperFunctions';

interface Modified {
  dates: DateTime[];
  startTime: DateTime;
  endTime: DateTime;
  substitutes: Map<string, string>;
}

export class Tutorial implements Modify<ITutorial, Modified> {
  readonly id!: string;
  readonly slot!: string;
  readonly tutor?: UserInEntity;
  readonly students!: string[];
  readonly teams!: string[];
  readonly correctors!: UserInEntity[];

  @Transform(({ value }) => value.map((val: string) => DateTime.fromISO(val)), {
    toClassOnly: true,
  })
  readonly dates!: DateTime[];

  @Transform(({ value }) => DateTime.fromISO(value), { toClassOnly: true })
  readonly startTime!: DateTime;

  @Transform(({ value }) => DateTime.fromISO(value), { toClassOnly: true })
  readonly endTime!: DateTime;

  @Transform(({ value }) => new Map(value))
  readonly substitutes!: Map<string, string>;

  static getDisplayString(hasSlot: { slot: string }): string {
    return `Tutorium ${hasSlot.slot.padStart(2, '0')}`;
  }

  /**
   * Returns basic information of the substitute of the given date. If there is no substitute `undefined` is returned.
   *
   * @param date Date to get the substitute ID for.
   *
   * @returns ID of the substitute for the given date or `undefined`.
   */
  getSubstitute(date: DateTime): string | undefined {
    return this.substitutes.get(parseDateToMapKey(date));
  }

  /**
   * @returns Unified display string of the tutorial including it's slot.
   */
  toDisplayString(): string {
    return Tutorial.getDisplayString(this);
  }

  /**
   * @returns String in the following format: '{slot} ({weekday}, {start}-{end})'
   */
  toDisplayStringWithTime(): string {
    const displayString = Tutorial.getDisplayString(this);
    const dayShort = this.dates[0]?.weekdayShort;
    const time = this.getTimeString();

    return `${displayString} (${dayShort}, ${time})`;
  }

  /**
   * @return String with start and end time in the format '{start}-{end}'.
   */
  getTimeString(): string {
    const startTime = this.startTime.toFormat('HH:mm');
    const endTime = this.endTime.toFormat('HH:mm');

    return `${startTime}-${endTime}`;
  }
}
