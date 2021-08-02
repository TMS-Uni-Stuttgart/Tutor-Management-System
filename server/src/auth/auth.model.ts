import { Role } from 'shared/model/Role';

export interface UserCredentials {
    readonly id: string;
    readonly username: string;
    readonly roles: readonly Role[];
}

export interface UserCredentialsWithPassword extends UserCredentials {
    readonly password: string;
}
