import { DocumentType, modelOptions, plugin, prop } from '@typegoose/typegoose';
import { fieldEncryption } from 'mongoose-field-encryption';
import { CollectionName } from '../../helpers/CollectionName';
import { ClientSettingsDTO } from '../../module/settings/settings.dto';
import { StaticSettings } from '../../module/settings/settings.static';
import {
  IClientSettings,
  IMailingAuthConfiguration,
  IMailingSettings,
} from '../../shared/model/Settings';

@modelOptions({ schemaOptions: { _id: false } })
class MailingAuthModel implements IMailingAuthConfiguration {
  @prop({ required: true })
  readonly user!: string;

  @prop({ required: true })
  readonly pass!: string;
}

@plugin(fieldEncryption, {
  secret: StaticSettings.getService().getDatabaseSecret(),
  fields: ['host', 'port', 'from', 'auth'],
})
@modelOptions({ schemaOptions: { _id: false } })
class MailingSettingsModel implements IMailingSettings {
  @prop({ required: true })
  readonly host!: string;

  @prop({ required: true })
  readonly port!: number;

  @prop({ required: true })
  readonly from!: string;

  @prop({ required: true })
  readonly subject!: string;

  @prop({ required: true, type: MailingAuthModel })
  readonly auth!: MailingAuthModel;

  constructor(fields?: IMailingSettings) {
    Object.assign(this, fields);
  }

  toDTO(): IMailingSettings {
    const { host, port, from, auth, subject } = this;
    return { host, port, from, auth, subject };
  }
}

@modelOptions({ schemaOptions: { collection: CollectionName.SETTINGS } })
export class SettingsModel {
  private static get internalDefaults(): IClientSettings {
    return { defaultTeamSize: 2, canTutorExcuseStudents: false };
  }

  @prop({ required: true })
  defaultTeamSize: number;

  @prop({ required: true })
  canTutorExcuseStudents: boolean;

  @prop({ type: MailingSettingsModel })
  mailingConfig?: MailingSettingsModel;

  constructor(fields?: Partial<IClientSettings>) {
    this.defaultTeamSize =
      fields?.defaultTeamSize ?? SettingsModel.internalDefaults.defaultTeamSize;
    this.canTutorExcuseStudents =
      fields?.canTutorExcuseStudents ?? SettingsModel.internalDefaults.canTutorExcuseStudents;

    this.mailingConfig = fields?.mailingConfig
      ? new MailingSettingsModel(fields.mailingConfig)
      : undefined;
  }

  toDTO(): IClientSettings {
    const defaultSettings = SettingsModel.internalDefaults;

    return {
      defaultTeamSize: this.defaultTeamSize ?? defaultSettings.defaultTeamSize,
      canTutorExcuseStudents: this.canTutorExcuseStudents ?? defaultSettings.canTutorExcuseStudents,
      mailingConfig: this.mailingConfig?.toDTO(),
    };
  }

  /**
   * Changes this settings document to use the newly provided settings.
   *
   * If a setting is not part of the provided `SettingsDTO` the old value previously saved in this document gets used.
   *
   * @param dto DTO with the new settings information.
   */
  assignDTO(dto: ClientSettingsDTO): void {
    for (const [key, value] of Object.entries(dto)) {
      if (typeof value !== 'function' && key in this) {
        (this as Record<string, unknown>)[key] = value ?? undefined;
      }
    }
  }
}

export type SettingsDocument = DocumentType<SettingsModel>;
