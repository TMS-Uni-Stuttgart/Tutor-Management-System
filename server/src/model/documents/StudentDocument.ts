import { Document, Model } from 'mongoose';
import { Student } from 'shared/dist/model/Student';
import { mapProp, prop, Ref, Typegoose } from 'typegoose';
import { CollectionName } from '../CollectionName';
import { AttendanceDocument, AttendanceSchema } from './AttendanceDocument';
import { TeamDocument } from './TeamDocument';
import { TutorialDocument } from './TutorialDocument';

export class StudentSchema extends Typegoose
  implements
    Omit<Student, 'id' | 'tutorial' | 'team' | 'courseOfStudies' | 'email' | 'attendance'> {
  @prop({ required: true, ref: { name: 'TutorialSchema' } })
  tutorial!: Ref<TutorialDocument>;

  @prop({ required: true })
  firstname!: string;

  @prop({ required: true })
  lastname!: string;

  @prop({ required: true })
  matriculationNo!: string;

  @prop()
  email?: string;

  @prop()
  courseOfStudies?: string;

  @prop({ ref: { name: 'TeamSchema' } })
  team?: Ref<TeamDocument>;

  @mapProp({ of: AttendanceSchema })
  attendance?: Map<string, AttendanceDocument>;

  // TODO: Make real Maps out of these.
  @mapProp({ of: Number, default: {} })
  points!: { [index: string]: number };

  @mapProp({ of: Number, default: {} })
  presentationPoints!: { [index: string]: number };

  @mapProp({ of: Number, default: {} })
  scheinExamResults!: { [index: string]: number };
}

export interface StudentDocument extends StudentSchema, Document {}

const StudentModel: Model<StudentDocument> = new StudentSchema().getModelForClass(StudentSchema, {
  schemaOptions: { collection: CollectionName.STUDENT },
});

export default StudentModel;
