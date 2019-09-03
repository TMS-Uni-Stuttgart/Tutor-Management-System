import { Document, Model, Schema, Types } from 'mongoose';
import { Tutorial } from 'shared/dist/model/Tutorial';
import { arrayProp, mapProp, prop, Ref, Typegoose } from 'typegoose';
import { CollectionName } from '../CollectionName';
import { StudentDocument } from './StudentDocument';
import { TeamDocument, TeamSchema } from './TeamDocument';
import { UserDocument } from './UserDocument';

export class TutorialSchema extends Typegoose
  implements Omit<Tutorial, 'id' | 'tutor' | 'correctors' | 'students' | 'teams' | 'substitutes'> {
  @prop({ required: true })
  slot!: number;

  @prop({ ref: { name: 'UserSchema' } })
  tutor?: Ref<UserDocument>;

  @arrayProp({ required: true, items: Schema.Types.Date })
  dates!: Date[];

  @prop({ required: true })
  startTime!: Date;

  @prop({ required: true })
  endTime!: Date;

  @arrayProp({ required: true, itemsRef: { name: 'StudentSchema' } })
  students!: Ref<StudentDocument>[];

  @arrayProp({ required: true, items: TeamSchema })
  teams!: Types.Array<TeamDocument>;

  @arrayProp({ required: true, itemsRef: { name: 'UserSchema' } })
  correctors!: Ref<UserDocument>[];

  @mapProp({ of: String, default: {} })
  substitutes?: Types.Map<string>;
}

export interface TutorialDocument extends TutorialSchema, Document {}

const TutorialModel: Model<TutorialDocument> = new TutorialSchema().getModelForClass(
  TutorialSchema,
  { schemaOptions: { collection: CollectionName.TUTORIAL } }
);

export default TutorialModel;
