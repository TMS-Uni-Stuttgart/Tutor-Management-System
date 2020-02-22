import { DocumentType, modelOptions, prop } from '@typegoose/typegoose';
import { AttendanceState } from '../../shared/model/Attendance';

@modelOptions({})
export class AttendanceModel {
  @prop({ required: true })
  date!: Date;

  @prop()
  note?: string;

  @prop({ enum: AttendanceState })
  state?: AttendanceState;
}

export type AttendanceDocument = DocumentType<AttendanceModel>;
