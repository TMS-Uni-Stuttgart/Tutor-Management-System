import { Role } from '../shared/model/Role';

export interface UserCredentials {
  readonly _id: string;
  readonly username: string;
  readonly roles: readonly Role[];
}

export interface UserCredentialsWithPassword extends UserCredentials {
  readonly password: string;
}
