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
  mailingConfig?: IMailingSettings;
}

export type IChangeSettingsDTO = { [K in keyof IClientSettings]?: IClientSettings[K] };
