import { DocumentType, modelOptions, prop } from '@typegoose/typegoose';
import { CollectionName } from '../../helpers/CollectionName';

@modelOptions({ schemaOptions: { collection: CollectionName.SETTINGS } })
export class SettingsModel {
  private static get internalDefaults(): ISettings {
    return { defaultTeamSize: 2, canTutorExcuseStudents: false };
  }

  @prop({ required: true })
  defaultTeamSize: number;

  @prop({ required: true })
  canTutorExcuseStudents: boolean;

  constructor(fields?: Partial<ISettings>) {
    this.defaultTeamSize =
      fields?.defaultTeamSize ?? SettingsModel.internalDefaults.defaultTeamSize;
    this.canTutorExcuseStudents =
      fields?.canTutorExcuseStudents ?? SettingsModel.internalDefaults.canTutorExcuseStudents;
  }

  toDTO(): ISettings {
    const defaultSettings = SettingsModel.internalDefaults;

    return {
      defaultTeamSize: this.defaultTeamSize ?? defaultSettings.defaultTeamSize,
      canTutorExcuseStudents: this.canTutorExcuseStudents ?? defaultSettings.canTutorExcuseStudents,
    };
  }
}

export type SettingsDocument = DocumentType<SettingsModel>;
