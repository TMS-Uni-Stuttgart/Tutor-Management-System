import { NamedElement, TutorialInEntity } from './Common';
import { Role } from './Role';
import { LoggedInUserSubstituteTutorial, LoggedInUserTutorial } from './Tutorial';

export interface LoggedInUser extends NamedElement {
  tutorials: LoggedInUserTutorial[];
  tutorialsToCorrect: LoggedInUserTutorial[];
  roles: User['roles'];
  hasTemporaryPassword: boolean;
  substituteTutorials: LoggedInUserSubstituteTutorial[];
}

export interface User extends NamedElement {
  readonly tutorials: TutorialInEntity[];
  readonly tutorialsToCorrect: TutorialInEntity[];
  readonly roles: Role[];
  readonly username: string;
  readonly email: string;
  readonly temporaryPassword?: string;
}

export interface UserDTO {
  firstname: User['firstname'];
  lastname: User['lastname'];
  tutorials: string[];
  tutorialsToCorrect: string[];
  roles: User['roles'];
  email: User['email'];
  username: User['username'];
}

export interface CreateUserDTO extends UserDTO {
  password: string;
}

export interface NewPasswordDTO {
  password: string;
}

export interface TutorInfo {
  lastname: string;
  firstname: string;
}
