import { Model, Schema } from 'mongoose';
import { Tutorial } from 'shared/dist/model/Tutorial';
import { arrayProp, prop, Typegoose } from 'typegoose';
import { CollectionName } from '../CollectionName';
import { CreateMongooseModel } from '../TypeHelpers';

export class TutorialSchema extends Typegoose implements Omit<Tutorial, 'id'> {
  // TODO: References
  @prop({ required: true })
  slot: number;

  @prop()
  tutor?: string;

  @arrayProp({ required: true, items: Schema.Types.Date })
  dates: Date[];

  @prop({ required: true })
  startTime: Date;

  @prop({ required: true })
  endTime: Date;

  @arrayProp({ required: true, items: String })
  students: string[];

  @arrayProp({ required: true, items: String })
  teams: string[];

  @arrayProp({ required: true, items: String })
  correctors: string[];

  @prop({ default: {} })
  substitutes: { [index: string]: string };
}

export type TutorialDocument = CreateMongooseModel<TutorialSchema>;

const TutorialModel: Model<TutorialDocument> = new TutorialSchema().getModelForClass(
  TutorialSchema,
  { schemaOptions: { collection: CollectionName.TUTORIAL } }
);

export default TutorialModel;
