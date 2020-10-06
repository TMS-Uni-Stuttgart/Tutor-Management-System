import { Transform, Type } from 'class-transformer';
import { DateTime, Interval } from 'luxon';
import { ITutorialInEntity } from 'shared/model/Common';
import { Role } from 'shared/model/Role';
import { ILoggedInUser } from 'shared/model/User';
import { Modify } from '../typings/Modify';

interface Modified {
  tutorials: TutorialInEntity[];
  tutorialsToCorrect: TutorialInEntity[];
  substituteTutorials: LoggedInSubstituteTutorial[];
}

export class TutorialInEntity implements Omit<ITutorialInEntity, 'time'> {
  readonly id!: string;
  readonly slot!: string;
  readonly weekday!: number;

  @Transform((value) => Interval.fromISO(value))
  readonly time!: Interval;
}

class LoggedInSubstituteTutorial extends TutorialInEntity {
  @Transform((values: string[]) => values.map((val) => DateTime.fromISO(val)), {
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
