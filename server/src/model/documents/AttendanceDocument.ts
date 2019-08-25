import { Document } from 'mongoose';
import { Attendance, AttendanceState } from 'shared/dist/model/Attendance';
import { prop, Typegoose } from 'typegoose';

export class AttendanceSchema extends Typegoose implements Omit<Attendance, 'id'> {
  // TODO: Is the special ID really needed due to the fact that we now have documents which we can save as embedded documents?
  // @prop({ unique: true })
  // _id!: AttendanceId;

  @prop({ required: true })
  date!: Date;

  @prop()
  note?: string;

  @prop({ enum: AttendanceState })
  state?: AttendanceState;
}

export interface AttendanceDocument extends AttendanceSchema, Document {}

// const AttendanceModel: Model<AttendanceDocument> = new AttendanceSchema().getModelForClass(
//   AttendanceSchema,
//   { schemaOptions: { collection: CollectionName.ATTENDANCE } }
// );

// export default AttendanceModel;
