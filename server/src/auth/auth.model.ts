export interface UserCredentials {
  readonly _id: string;
  readonly username: string;
}

export interface UserCredentialsWithPassword extends UserCredentials {
  readonly password: string;
}
