import { Document, Model } from 'mongoose';
import { prop, Typegoose } from '@hasezoey/typegoose';
import { CollectionName } from '../CollectionName';
import { Scheincriteria } from '../scheincriteria/Scheincriteria';

export class ScheincriteriaSchema extends Typegoose {
  @prop({ required: true })
  name!: string;

  @prop({ required: true })
  criteria!: Scheincriteria;
}

export interface ScheincriteriaDocument extends ScheincriteriaSchema, Document {}

const ScheincriteriaModel: Model<ScheincriteriaDocument> = new ScheincriteriaSchema().getModelForClass(
  ScheincriteriaSchema,
  {
    schemaOptions: { collection: CollectionName.SCHEINCRITERIA },
  }
);

export default ScheincriteriaModel;
