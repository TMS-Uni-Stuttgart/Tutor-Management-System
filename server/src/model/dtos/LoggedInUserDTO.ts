import { Role } from 'shared/dist/model/Role';
import { LoggedInUserSubstituteTutorial, LoggedInUserTutorial } from 'shared/dist/model/Tutorial';
import { LoggedInUser } from 'shared/dist/model/User';
import { TutorialDocument } from '../TutorialDocument';
import { UserDocument } from '../UserDocument';

export class LoggedInUserTutorialDTO implements LoggedInUserTutorial {
  readonly id: string;
  readonly slot: number;

  constructor({ _id, slot }: TutorialDocument) {
    this.id = _id;
    this.slot = slot;
  }
}

export class LoggedInUserSubstituteTutorialDTO extends LoggedInUserTutorialDTO
  implements LoggedInUserSubstituteTutorial {
  readonly dates: Date[];

  constructor(tutorial: TutorialDocument, dates: Date[]) {
    super(tutorial);

    this.dates = dates;
  }
}

export class LoggedInUserDTO implements LoggedInUser {
  readonly id: string;
  readonly firstname: string;
  readonly lastname: string;
  readonly roles: Role[];
  readonly hasTemporaryPassword: boolean;
  readonly tutorials: LoggedInUserTutorialDTO[];
  readonly substituteTutorials: LoggedInUserSubstituteTutorialDTO[];

  constructor(
    { _id, firstname, lastname, roles, temporaryPassword, tutorials }: UserDocument,
    substituteTutorials: LoggedInUserSubstituteTutorialDTO[]
  ) {
    this.id = _id;
    this.firstname = firstname;
    this.lastname = lastname;
    this.roles = roles;
    this.hasTemporaryPassword = !!temporaryPassword;
    this.substituteTutorials = substituteTutorials;
    this.tutorials = tutorials.map(t => {
      if ('_id' in t) {
        return new LoggedInUserTutorialDTO(t);
      }

      return null;
    });
  }
}
