import { Attendance, AttendanceState, AttendanceId } from 'shared/dist/model/Attendance';
import { prop, Typegoose } from 'typegoose';
import { CreateMongooseModel } from '../TypeHelpers';

export class AttendanceSchema extends Typegoose implements Omit<Attendance, 'id'> {
  @prop({ unique: true })
  _id: AttendanceId;

  @prop({ required: true })
  date: Date;

  @prop()
  note?: string;

  @prop({ enum: AttendanceState })
  state?: AttendanceState;
}

export type AttendanceDocument = CreateMongooseModel<AttendanceSchema>;

// const AttendanceModel: Model<AttendanceDocument> = new AttendanceSchema().getModelForClass(
//   AttendanceSchema,
//   { schemaOptions: { collection: CollectionName.ATTENDANCE } }
// );

// export default AttendanceModel;
