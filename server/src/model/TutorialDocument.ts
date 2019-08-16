import { CreateMongooseModel } from './TypeHelpers';
import { Tutorial } from 'shared/dist/model/Tutorial';
import { Schema, model, Model } from 'mongoose';
import uuid from 'uuid/v4';
import { SchemaName } from './SchemaName';

export type TutorialDocument = CreateMongooseModel<Tutorial>;

const TutorialSchema: Schema<TutorialDocument> = new Schema<TutorialDocument>({
  _id: { type: String, default: uuid },
  slot: { type: Number, required: true },
  // TODO: FINISH ME!
});

const TutorialModel: Model<TutorialDocument> = model<TutorialDocument>(
  SchemaName.TUTORIAL,
  TutorialSchema
);

export default TutorialModel;
