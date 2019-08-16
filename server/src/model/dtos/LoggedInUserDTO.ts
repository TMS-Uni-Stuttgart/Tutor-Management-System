import { Role } from 'shared/dist/model/Role';
import {
  LoggedInUserSubstituteTutorial,
  LoggedInUserTutorial,
  Tutorial,
} from 'shared/dist/model/Tutorial';
import { LoggedInUser } from 'shared/dist/model/User';
import { UserDocument } from '../UserDocument';

export class LoggedInUserTutorialDTO implements LoggedInUserTutorial {
  readonly id: string;
  readonly slot: number;

  constructor({ id, slot }: Tutorial) {
    this.id = id;
    this.slot = slot;
  }
}

export class LoggedInUserSubstituteTutorialDTO extends LoggedInUserTutorialDTO
  implements LoggedInUserSubstituteTutorial {
  readonly dates: Date[];

  constructor(tutorial: Tutorial, dates: Date[]) {
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
    { id, firstname, lastname, roles, temporaryPassword, tutorials }: UserDocument,
    substituteTutorials: LoggedInUserSubstituteTutorialDTO[]
  ) {
    this.id = id;
    this.firstname = firstname;
    this.lastname = lastname;
    this.roles = roles;
    this.hasTemporaryPassword = !!temporaryPassword;
    this.tutorials = tutorials.map(t => new LoggedInUserTutorialDTO(t));
    this.substituteTutorials = substituteTutorials;
  }
}
