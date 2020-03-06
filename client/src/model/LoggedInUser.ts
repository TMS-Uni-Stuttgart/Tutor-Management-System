import { Type } from 'class-transformer';
import { DateTime } from 'luxon';
import { TutorialInEntity } from '../../../server/src/shared/model/Common';
import { Role } from '../../../server/src/shared/model/Role';
import { ILoggedInUser } from '../../../server/src/shared/model/User';
import { Modify } from '../typings/Modify';

interface Modified {
  substituteTutorials: LoggedInSubstituteTutorial[];
}

class LoggedInSubstituteTutorial {
  id!: string;
  slot!: string;
  dates!: DateTime[];
}

export class LoggedInUser implements Modify<ILoggedInUser, Modified> {
  id!: string;
  firstname!: string;
  lastname!: string;
  tutorials!: TutorialInEntity[];
  tutorialsToCorrect!: TutorialInEntity[];
  roles!: Role[];
  hasTemporaryPassword!: boolean;

  @Type(() => LoggedInSubstituteTutorial)
  substituteTutorials!: LoggedInSubstituteTutorial[];
}
