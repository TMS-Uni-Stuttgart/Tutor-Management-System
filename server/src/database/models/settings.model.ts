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
  fields: ['host', 'port', 'from', 'subject', 'auth'],
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
    return {
      defaultTeamSize: 2,
      canTutorExcuseStudents: false,
      gradingFilename: 'Ex{{sheetNo}}_{{teamName}}',
    };
  }

  @prop({ required: true })
  defaultTeamSize: number;

  @prop({ required: true })
  canTutorExcuseStudents: boolean;

  @prop({ required: true })
  gradingFilename: string;

  @prop({ type: MailingSettingsModel, required: false })
  mailingConfig?: MailingSettingsModel;

  constructor(fields?: Partial<IClientSettings>) {
    const {
      defaultTeamSize,
      canTutorExcuseStudents,
      gradingFilename: gradingFileName,
    } = SettingsModel.internalDefaults;

    this.defaultTeamSize = fields?.defaultTeamSize ?? defaultTeamSize;
    this.canTutorExcuseStudents = fields?.canTutorExcuseStudents ?? canTutorExcuseStudents;
    this.gradingFilename = fields?.gradingFilename ?? gradingFileName;

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
      gradingFilename: this.gradingFilename,
    };
  }

  /**
   * Changes this settings document to use the newly provided settings.
   *
   * This will override __all__ settings with the ones from the given DTO.
   *
   * @param dto DTO with the new settings information.
   */
  assignDTO(dto: ClientSettingsDTO): void {
    this.defaultTeamSize = dto.defaultTeamSize;
    this.canTutorExcuseStudents = dto.canTutorExcuseStudents;

    this.mailingConfig = dto.mailingConfig
      ? new MailingSettingsModel(dto.mailingConfig)
      : undefined;

    // Remove possible file extensions.
    this.gradingFilename = dto.gradingFilename.replace(/\.[^/.]+$/, '');
  }
}

export type SettingsDocument = DocumentType<SettingsModel>;
