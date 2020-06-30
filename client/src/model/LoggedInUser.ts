import { Transform, Type } from 'class-transformer';
import { DateTime } from 'luxon';
import { TutorialInEntity } from '../../../server/src/shared/model/Common';
import { Role } from '../../../server/src/shared/model/Role';
import { ILoggedInUser } from '../../../server/src/shared/model/User';
import { Modify } from '../typings/Modify';

interface Modified {
  substituteTutorials: LoggedInSubstituteTutorial[];
}

class LoggedInSubstituteTutorial {
  readonly id!: string;
  readonly slot!: string;

  @Transform((values: string[]) => values.map((val) => DateTime.fromISO(val)), {
    toClassOnly: true,
  })
  readonly dates!: DateTime[];
}

export class LoggedInUser implements Modify<ILoggedInUser, Modified> {
  readonly id!: string;
  readonly firstname!: string;
  readonly lastname!: string;
  readonly tutorials!: TutorialInEntity[];
  readonly tutorialsToCorrect!: TutorialInEntity[];
  readonly roles!: Role[];

  hasTemporaryPassword!: boolean;

  @Type(() => LoggedInSubstituteTutorial)
  readonly substituteTutorials!: LoggedInSubstituteTutorial[];

  isAdmin(): boolean {
    return this.roles.includes(Role.ADMIN);
  }
}
