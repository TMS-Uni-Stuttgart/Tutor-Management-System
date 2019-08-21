import { Model } from 'mongoose';
import { arrayProp, prop, Ref, Typegoose } from 'typegoose';
import { CollectionName } from '../CollectionName';
import { CreateMongooseModel } from '../TypeHelpers';
import { Student } from 'shared/dist/model/Student';
import { Attendance } from 'shared/dist/model/Attendance';

export class StudentSchema extends Typegoose implements Omit<Student, 'id'> {
  // TODO: Refs
  // TODO: Finish @prop annotations
  @prop({ required: true })
  tutorial: string;

  @prop({ required: true })
  firstname: string;

  @prop({ required: true })
  lastname: string;

  @prop({ required: true })
  matriculationNo: string;

  @prop()
  email: string;

  @prop()
  courseOfStudies: string;

  @prop()
  team?: string;

  attendance: { [index: string]: Attendance };
  points: { [index: string]: number };
  presentationPoints: { [index: string]: number };
  scheinExamResults: { [index: string]: number };
}

export type StudentDocument = CreateMongooseModel<StudentSchema>;

const StudentModel: Model<StudentDocument> = new StudentSchema().getModelForClass(StudentSchema, {
  schemaOptions: { collection: CollectionName.STUDENT },
});

export default StudentModel;
