import { Model } from 'mongoose';
import { arrayProp, prop, Ref, Typegoose, mapProp } from 'typegoose';
import { CollectionName } from '../CollectionName';
import { CreateMongooseModel } from '../TypeHelpers';
import { Team } from 'shared/dist/model/Team';
import { StudentDocument } from './StudentDocument';
import { TutorialDocument } from './TutorialDocument';

export class TeamSchema extends Typegoose implements Omit<Team, 'id' | 'tutorial' | 'students'> {
  @prop({ required: true })
  teamNo: number;

  @prop({ required: true, ref: { name: 'TutorialSchema' } })
  tutorial: Ref<TutorialDocument>;

  @arrayProp({ required: true, itemsRef: { name: 'StudentSchema' } })
  students: Ref<StudentDocument>[];

  @mapProp({ of: Number, default: {} })
  points: { [index: string]: number };
}

export type TeamDocument = CreateMongooseModel<TeamSchema>;

const TeamModel: Model<TeamDocument> = new TeamSchema().getModelForClass(TeamSchema, {
  schemaOptions: { collection: CollectionName.TEAM },
});

export default TeamModel;
