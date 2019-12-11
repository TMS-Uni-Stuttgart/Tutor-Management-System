import { DocumentType, getModelForClass, prop } from '@typegoose/typegoose';
import { Model } from 'mongoose';
import { CollectionName } from '../CollectionName';
import { Scheincriteria } from '../scheincriteria/Scheincriteria';

export class ScheincriteriaSchema {
  @prop({ required: true })
  name!: string;

  @prop({ required: true })
  criteria!: Scheincriteria;
}

export type ScheincriteriaDocument = DocumentType<ScheincriteriaSchema>;

const ScheincriteriaModel: Model<ScheincriteriaDocument> = getModelForClass(ScheincriteriaSchema, {
  schemaOptions: { collection: CollectionName.SCHEINCRITERIA },
});

export default ScheincriteriaModel;
