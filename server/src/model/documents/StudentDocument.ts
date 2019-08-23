import { Model } from 'mongoose';
import { Attendance } from 'shared/dist/model/Attendance';
import { Student } from 'shared/dist/model/Student';
import { mapProp, prop, Ref, Typegoose } from 'typegoose';
import { CollectionName } from '../CollectionName';
import { CreateMongooseModel } from '../TypeHelpers';
import { AttendanceSchema } from './AttendanceDocument';
import { TutorialDocument } from './TutorialDocument';
import { TeamDocument } from './TeamDocument';

export class StudentSchema extends Typegoose
  implements Omit<Student, 'id' | 'tutorial' | 'team' | 'courseOfStudies' | 'email'> {
  @prop({ required: true, ref: { name: 'TutorialSchema' } })
  tutorial: Ref<TutorialDocument>;

  @prop({ required: true })
  firstname: string;

  @prop({ required: true })
  lastname: string;

  @prop({ required: true })
  matriculationNo: string;

  @prop()
  email?: string;

  @prop()
  courseOfStudies?: string;

  @prop({ ref: { name: 'TeamSchema' } })
  team?: Ref<TeamDocument>;

  @mapProp({ of: AttendanceSchema })
  attendance: { [index: string]: Attendance };

  @mapProp({ of: Number, default: {} })
  points: { [index: string]: number };

  @mapProp({ of: Number, default: {} })
  presentationPoints: { [index: string]: number };

  @mapProp({ of: Number, default: {} })
  scheinExamResults: { [index: string]: number };
}

export type StudentDocument = CreateMongooseModel<StudentSchema>;

const StudentModel: Model<StudentDocument> = new StudentSchema().getModelForClass(StudentSchema, {
  schemaOptions: { collection: CollectionName.STUDENT },
});

export default StudentModel;
