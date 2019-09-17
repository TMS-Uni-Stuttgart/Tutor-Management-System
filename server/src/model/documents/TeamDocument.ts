import { Document } from 'mongoose';
import { PointMapDTO } from 'shared/dist/model/Points';
import { Team } from 'shared/dist/model/Team';
import { arrayProp, prop, Ref, Typegoose, pre } from 'typegoose';
import { StudentDocument } from './StudentDocument';
import { TutorialDocument } from './TutorialDocument';

// TODO: REMOVE PRE HOOKS AFTER TESTING!
@pre<TeamDocument>('save', function(next) {
  console.log('TEAM DOC SAVED!');
  next();
})
@pre<TeamDocument>('find', function(next, docs?: any[]) {
  console.log('TEAM DOC FOUND');
  console.log(docs);
  next();
})
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
