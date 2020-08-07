export interface IMailingAuthConfiguration {
  user: string;
  pass: string;
}

export interface IMailingSettings {
  from: string;
  host: string;
  port: number;
  subject: string;
  auth: IMailingAuthConfiguration;
}

export interface IClientSettings {
  defaultTeamSize: number;
  canTutorExcuseStudents: boolean;
  /** Filename for gradings __without__ extension. */
  gradingFilename: string;
  mailingConfig?: IMailingSettings;
}

export type IChangeSettingsDTO = { [K in keyof IClientSettings]: IClientSettings[K] };
