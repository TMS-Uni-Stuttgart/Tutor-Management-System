import { ITutorialInEntity, NamedElement } from './Common';
import { Role } from './Role';

export interface ILoggedInUserSubstituteTutorial extends ITutorialInEntity {
  dates: string[];
}

export interface ILoggedInUser extends NamedElement {
  tutorials: ITutorialInEntity[];
  tutorialsToCorrect: ITutorialInEntity[];
  roles: IUser['roles'];
  hasTemporaryPassword: boolean;
  substituteTutorials: ILoggedInUserSubstituteTutorial[];
}

export interface IUser extends NamedElement {
  readonly tutorials: ITutorialInEntity[];
  readonly tutorialsToCorrect: ITutorialInEntity[];
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
