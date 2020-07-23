import { DocumentType, modelOptions, prop } from '@typegoose/typegoose';
import { CollectionName } from '../../helpers/CollectionName';

@modelOptions({ schemaOptions: { collection: CollectionName.SETTINGS } })
export class SettingsModel {
  @prop()
  defaultTeamSize?: number;
}

export type SettingsDocument = DocumentType<SettingsModel>;
