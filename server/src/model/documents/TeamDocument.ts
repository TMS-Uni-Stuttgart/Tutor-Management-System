import { arrayProp, prop, Ref, Typegoose } from '@typegoose/typegoose';
import { Document } from 'mongoose';
import { PointMapDTO } from 'shared/dist/model/Points';
import { Team } from 'shared/dist/model/Team';
import { StudentDocument } from './StudentDocument';
import { TutorialDocument } from './TutorialDocument';

export class TeamSchema extends Typegoose
  implements Omit<Team, 'id' | 'tutorial' | 'students' | 'points'> {
  @prop({ required: true })
  teamNo!: number;

  @prop({ required: true, ref: { name: 'TutorialSchema' } })
  tutorial!: Ref<TutorialDocument>;

  @arrayProp({ required: true, itemsRef: { name: 'StudentSchema' } })
  students!: Ref<StudentDocument>[];

  @prop({ default: {} })
  points!: PointMapDTO;
}

export interface TeamDocument extends TeamSchema, Document {}

// Register the teamschema to be able to populate the corresponding fields in the other documents.
new TeamSchema().getModelForClass(TeamSchema, {
  schemaOptions: { collection: 'teams' },
});
