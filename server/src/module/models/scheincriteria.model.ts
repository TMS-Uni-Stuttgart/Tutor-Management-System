import { DocumentType, modelOptions, prop } from '@typegoose/typegoose';
import { CollectionName } from '../../helpers/CollectionName';
import { Scheincriteria } from '../../scheincriteria/Scheincriteria';

@modelOptions({ schemaOptions: { collection: CollectionName.SCHEINCRITERIA } })
export class ScheincriteriaModel {
  @prop({ required: true })
  name!: string;

  @prop({ required: true })
  criteria!: Scheincriteria;
}

export type ScheincriteriaDocument = DocumentType<ScheincriteriaModel>;
