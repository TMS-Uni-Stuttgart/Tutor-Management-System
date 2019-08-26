import { Document } from 'mongoose';
import { Team } from 'shared/dist/model/Team';
import { arrayProp, mapProp, prop, Ref, Typegoose } from 'typegoose';
import { StudentDocument } from './StudentDocument';
import { TutorialDocument } from './TutorialDocument';

export class TeamSchema extends Typegoose implements Omit<Team, 'id' | 'tutorial' | 'students'> {
  @prop({ required: true })
  teamNo!: number;

  @prop({ required: true, ref: { name: 'TutorialSchema' } })
  tutorial!: Ref<TutorialDocument>;

  @arrayProp({ required: true, itemsRef: { name: 'StudentSchema' } })
  students!: Ref<StudentDocument>[];

  @mapProp({ of: Number, default: {} })
  points!: { [index: string]: number };
}

export interface TeamDocument extends TeamSchema, Document {}
