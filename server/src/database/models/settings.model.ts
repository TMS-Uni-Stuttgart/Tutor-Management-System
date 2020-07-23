import { modelOptions } from '@typegoose/typegoose';
import { CollectionName } from '../../helpers/CollectionName';

@modelOptions({ schemaOptions: { collection: CollectionName.SETTINGS } })
export class SettingsModel {}
