import { Document, Model, Types } from 'mongoose';
import { fieldEncryption } from 'mongoose-field-encryption';
import { PointMapDTO } from 'shared/dist/model/Points';
import { Student } from 'shared/dist/model/Student';
import { mapProp, plugin, prop, Ref, Typegoose } from 'typegoose';
import databaseConfig from '../../helpers/database';
import { CollectionName } from '../CollectionName';
import { AttendanceDocument, AttendanceSchema } from './AttendanceDocument';
import { TeamDocument } from './TeamDocument';
import { TutorialDocument } from './TutorialDocument';

@plugin(fieldEncryption, {
  secret: databaseConfig.secret,
  fields: ['firstname', 'lastname', 'courseOfStudies', 'email', 'matriculationNo'],
})
export class StudentSchema extends Typegoose
  implements
    Omit<
      Student,
      | 'id'
      | 'tutorial'
      | 'team'
      | 'courseOfStudies'
      | 'email'
      | 'attendance'
      | 'points'
      | 'presentationPoints'
      | 'scheinExamResults'
    > {
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
  attendance?: Types.Map<AttendanceDocument>;

  @prop({ default: {} })
  points!: PointMapDTO;

  @mapProp({ of: Number })
  presentationPoints?: Types.Map<number>;

  @prop({ default: {} })
  scheinExamResults!: PointMapDTO;
}

export interface StudentDocument extends StudentSchema, Document {}

const StudentModel: Model<StudentDocument> = new StudentSchema().getModelForClass(StudentSchema, {
  schemaOptions: { collection: CollectionName.STUDENT },
});

export default StudentModel;
