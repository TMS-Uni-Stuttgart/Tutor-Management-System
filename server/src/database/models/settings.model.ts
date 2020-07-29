import { DocumentType, modelOptions, prop } from '@typegoose/typegoose';
import { CollectionName } from '../../helpers/CollectionName';
import { MailingConfiguration } from '../../module/settings/model/MailingConfiguration';
import { ClientSettingsDTO } from '../../module/settings/settings.dto';
import { IClientSettings } from '../../shared/model/Settings';

@modelOptions({ schemaOptions: { collection: CollectionName.SETTINGS } })
export class SettingsModel {
  private static get internalDefaults(): IClientSettings {
    return { defaultTeamSize: 2, canTutorExcuseStudents: false };
  }

  @prop({ required: true })
  defaultTeamSize: number;

  @prop({ required: true })
  canTutorExcuseStudents: boolean;

  @prop()
  mailingConfig?: MailingConfiguration;

  constructor(fields?: Partial<IClientSettings>) {
    this.defaultTeamSize =
      fields?.defaultTeamSize ?? SettingsModel.internalDefaults.defaultTeamSize;
    this.canTutorExcuseStudents =
      fields?.canTutorExcuseStudents ?? SettingsModel.internalDefaults.canTutorExcuseStudents;
    this.mailingConfig = fields?.mailingConfig;
  }

  toDTO(): IClientSettings {
    const defaultSettings = SettingsModel.internalDefaults;

    return {
      defaultTeamSize: this.defaultTeamSize ?? defaultSettings.defaultTeamSize,
      canTutorExcuseStudents: this.canTutorExcuseStudents ?? defaultSettings.canTutorExcuseStudents,
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
        (this as Record<string, unknown>)[key] = value;
      }
    }
  }
}

export type SettingsDocument = DocumentType<SettingsModel>;
