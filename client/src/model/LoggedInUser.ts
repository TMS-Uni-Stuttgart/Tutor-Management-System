import { Transform, Type } from 'class-transformer';
import { DateTime, Interval } from 'luxon';
import { ITutorialInEntity } from 'shared/model/Common';
import { Role } from 'shared/model/Role';
import { ILoggedInUser } from 'shared/model/User';
import { compareTutorials } from '../hooks/LoginService.helpers';
import { Modify } from '../typings/Modify';

interface Modified {
  tutorials: TutorialInEntity[];
  tutorialsToCorrect: TutorialInEntity[];
  substituteTutorials: LoggedInSubstituteTutorial[];
}

function valueIsInterval(value: unknown): value is { s: string; e: string } {
  return typeof value === 'object' && !!value && 's' in value && 'e' in value;
}

export class TutorialInEntity implements Omit<ITutorialInEntity, 'time'> {
  readonly id!: string;
  readonly slot!: string;
  readonly weekday!: number;

  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return Interval.fromISO(value);
    }

    if (valueIsInterval(value)) {
      return Interval.fromDateTimes(DateTime.fromISO(value.s), DateTime.fromISO(value.e));
    }

    throw new Error('INVALID_LUXON_INTERVAL');
  })
  readonly time!: Interval;
}

class LoggedInSubstituteTutorial extends TutorialInEntity {
  @Transform(({ value }) => value.map((val: string) => DateTime.fromISO(val)), {
    toClassOnly: true,
  })
  readonly dates!: DateTime[];
}

export class LoggedInUser implements Modify<ILoggedInUser, Modified> {
  readonly id!: string;
  readonly firstname!: string;
  readonly lastname!: string;
  readonly roles!: Role[];

  @Type(() => TutorialInEntity)
  @Transform(({ value: values }) => {
    if (!Array.isArray(values)) {
      return values;
    }

    values.sort(compareTutorials);
    return values;
  })
  readonly tutorials!: TutorialInEntity[];

  @Type(() => TutorialInEntity)
  readonly tutorialsToCorrect!: TutorialInEntity[];

  hasTemporaryPassword!: boolean;

  @Type(() => LoggedInSubstituteTutorial)
  readonly substituteTutorials!: LoggedInSubstituteTutorial[];

  isAdmin(): boolean {
    return this.roles.includes(Role.ADMIN);
  }
}
