import { Document, Types } from 'mongoose';
import { Team } from 'shared/dist/model/Team';
import { arrayProp, mapProp, prop, Ref, Typegoose } from 'typegoose';
import { StudentDocument } from './StudentDocument';
import { TutorialDocument } from './TutorialDocument';
import { PointMapEntry } from 'shared/dist/model/Sheet';

export class TeamSchema extends Typegoose
  implements Omit<Team, 'id' | 'tutorial' | 'students' | 'points'> {
  @prop({ required: true })
  teamNo!: number;

  @prop({ required: true, ref: { name: 'TutorialSchema' } })
  tutorial!: Ref<TutorialDocument>;

  @arrayProp({ required: true, itemsRef: { name: 'StudentSchema' } })
  students!: Ref<StudentDocument>[];

  @mapProp({ of: Object, default: new Types.Map() })
  points!: Types.Map<PointMapEntry>;
}

export interface TeamDocument extends TeamSchema, Document {}
