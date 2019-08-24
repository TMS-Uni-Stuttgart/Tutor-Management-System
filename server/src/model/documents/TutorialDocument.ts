import { Model, Schema } from 'mongoose';
import { Tutorial } from 'shared/dist/model/Tutorial';
import { arrayProp, mapProp, prop, Ref, Typegoose } from 'typegoose';
import { CollectionName } from '../CollectionName';
import { CreateMongooseModel } from '../TypeHelpers';
import { StudentDocument } from './StudentDocument';
import { TeamDocument } from './TeamDocument';
import { UserDocument } from './UserDocument';

export class TutorialSchema extends Typegoose
  implements Omit<Tutorial, 'id' | 'tutor' | 'correctors' | 'students' | 'teams'> {
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

  @arrayProp({ required: true, itemsRef: { name: 'TeamSchema' } })
  teams!: Ref<TeamDocument>[];

  @arrayProp({ required: true, itemsRef: { name: 'UserSchema' } })
  correctors!: Ref<UserDocument>[];

  @mapProp({ of: String, default: {} })
  substitutes!: { [index: string]: string };
}

export type TutorialDocument = CreateMongooseModel<TutorialSchema>;

const TutorialModel: Model<TutorialDocument> = new TutorialSchema().getModelForClass(
  TutorialSchema,
  { schemaOptions: { collection: CollectionName.TUTORIAL } }
);

export default TutorialModel;
