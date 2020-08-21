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
  /** Filename for gradings for teams / students __without__ extension. */
  gradingFilename: string;
  /** Filename for file for gradings of all team of a tutorial __without__ extension. */
  tutorialGradingFilename: string;
  mailingConfig?: IMailingSettings;
}

export type IChangeSettingsDTO = { [K in keyof IClientSettings]: IClientSettings[K] };
