export interface IMailingAuthConfiguration {
  user: string;
  pass: string;
}

export interface IMailingSettings {
  from: string;
  host: string;
  port: number;
  auth: IMailingAuthConfiguration;
}

export interface IClientSettings {
  defaultTeamSize: number;
  canTutorExcuseStudents: boolean;
  mailingConfig?: IMailingSettings;
}
