import { CreateMongooseModel } from './TypeHelpers';
import { Tutorial } from 'shared/dist/model/Tutorial';
import { Schema, model, Model } from 'mongoose';
import uuid from 'uuid/v4';
import { SchemaName } from './SchemaName';

interface InternalTutorial extends Omit<Tutorial, 'substitutes'> {
  substitutes: Map<string, string>;
}

export type TutorialDocument = CreateMongooseModel<Tutorial>;

const TutorialSchema: Schema<TutorialDocument> = new Schema<TutorialDocument>({
  _id: { type: String, default: uuid },
  slot: { type: Number, required: true },
  tutor: { type: Schema.Types.String, ref: SchemaName.USER },
  dates: { type: [Schema.Types.Date], required: true },
  startTime: { type: Schema.Types.Date, required: true },
  endTime: { type: Schema.Types.Date, required: true },

  // TODO: References
  students: { type: [String], required: true },
  correctors: { type: [String], required: true },
  teams: { type: [String], required: true },
  substitutes: { type: Schema.Types.Mixed, default: {} },
});

const TutorialModel: Model<TutorialDocument> = model<TutorialDocument>(
  SchemaName.TUTORIAL,
  TutorialSchema
);

export default TutorialModel;
