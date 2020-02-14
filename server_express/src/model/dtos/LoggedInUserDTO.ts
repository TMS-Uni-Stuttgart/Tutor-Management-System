import { Role } from 'shared/dist/model/Role';
import { LoggedInUserSubstituteTutorial, LoggedInUserTutorial } from 'shared/dist/model/Tutorial';
import { LoggedInUser } from 'shared/dist/model/User';
import { TutorialDocument } from '../documents/TutorialDocument';
import { UserDocument } from '../documents/UserDocument';

export class LoggedInUserTutorialDTO implements LoggedInUserTutorial {
  readonly id: string;
  readonly slot: string;

  constructor({ id, slot }: Pick<TutorialDocument, 'id' | 'slot'>) {
    this.id = id;
    this.slot = slot;
  }
}

export class LoggedInUserSubstituteTutorialDTO extends LoggedInUserTutorialDTO
  implements LoggedInUserSubstituteTutorial {
  readonly dates: string[];

  constructor(tutorial: Pick<TutorialDocument, 'id' | 'slot'>, dates: Date[]) {
    super(tutorial);

    this.dates = dates.map(date => date.toDateString());
  }
}

export class LoggedInUserDTO implements LoggedInUser {
  readonly id: string;
  readonly firstname: string;
  readonly lastname: string;
  readonly roles: Role[];
  readonly hasTemporaryPassword: boolean;
  readonly tutorials: LoggedInUserTutorialDTO[];
  readonly tutorialsToCorrect: LoggedInUserTutorialDTO[];
  readonly substituteTutorials: LoggedInUserSubstituteTutorialDTO[];

  constructor(
    { _id, firstname, lastname, roles, temporaryPassword, tutorials }: UserDocument,
    substituteTutorials: LoggedInUserSubstituteTutorialDTO[],
    correctedTutorials: LoggedInUserTutorialDTO[]
  ) {
    this.id = _id;
    this.firstname = firstname;
    this.lastname = lastname;
    this.roles = roles;
    this.hasTemporaryPassword = !!temporaryPassword;
    this.substituteTutorials = substituteTutorials;

    this.tutorials = tutorials
      .filter(t => '_id' in t)
      .map(t => {
        return new LoggedInUserTutorialDTO(t as TutorialDocument);
      });

    this.tutorialsToCorrect = [...correctedTutorials];
  }
}
