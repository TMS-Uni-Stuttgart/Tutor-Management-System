import { NamedElement, TutorialInEntity } from './Common';
import { Role } from './Role';

export interface ILoggedInUserSubstituteTutorial extends TutorialInEntity {
  dates: string[];
}

export interface ILoggedInUser extends NamedElement {
  tutorials: TutorialInEntity[];
  tutorialsToCorrect: TutorialInEntity[];
  roles: IUser['roles'];
  hasTemporaryPassword: boolean;
  substituteTutorials: ILoggedInUserSubstituteTutorial[];
}

export interface IUser extends NamedElement {
  readonly tutorials: TutorialInEntity[];
  readonly tutorialsToCorrect: TutorialInEntity[];
  readonly roles: Role[];
  readonly username: string;
  readonly email: string;
  readonly temporaryPassword?: string;
}

export interface IUserDTO {
  firstname: IUser['firstname'];
  lastname: IUser['lastname'];
  tutorials: string[];
  tutorialsToCorrect: string[];
  roles: IUser['roles'];
  email: IUser['email'];
  username: IUser['username'];
}

export interface ICreateUserDTO extends IUserDTO {
  password: string;
}

export interface INewPasswordDTO {
  password: string;
}
