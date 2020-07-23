import { DocumentType, modelOptions, prop } from '@typegoose/typegoose';
import { CollectionName } from '../../helpers/CollectionName';
import { NoFunctions } from '../../helpers/NoFunctions';

@modelOptions({ schemaOptions: { collection: CollectionName.SETTINGS } })
export class SettingsModel {
  @prop()
  defaultTeamSize?: number;

  @prop()
  canTutorExcuseStudents?: boolean;

  constructor(fields?: NoFunctions<SettingsModel>) {
    this.defaultTeamSize = fields?.defaultTeamSize;
    this.canTutorExcuseStudents = fields?.canTutorExcuseStudents;
  }
}

export type SettingsDocument = DocumentType<SettingsModel>;
