import { NamedElement } from './Common';
import { Role } from './Role';
import { LoggedInUserTutorial, LoggedInUserSubstituteTutorial } from './Tutorial';

export interface LoggedInUser extends NamedElement {
  readonly tutorials: LoggedInUserTutorial[];
  readonly roles: User['roles'];
  readonly hasTemporaryPassword: boolean;
  readonly substituteTutorials: LoggedInUserSubstituteTutorial[];
}

export interface User extends NamedElement {
  readonly tutorials: string[];
  readonly roles: Role[];
  readonly username: string;
  readonly temporaryPassword: string;
}

export interface UserDTO {
  firstname: User['firstname'];
  lastname: User['lastname'];
  tutorials: string[];
  roles: User['roles'];
}

export interface CreateUserDTO extends UserDTO {
  username: string;
  password: string;
}
