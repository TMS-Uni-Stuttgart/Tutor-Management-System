import { DocumentType, getModelForClass, prop } from '@typegoose/typegoose';
import { startOfDay } from 'date-fns';
import { Model } from 'mongoose';
import { Attendance, AttendanceDTO, AttendanceState } from 'shared/dist/model/Attendance';
import { TypegooseDocument } from '../../helpers/typings';

export class AttendanceSchema implements Omit<Attendance, 'id'> {
  @prop({ required: true })
  date!: Date;

  @prop()
  note?: string;

  @prop({ enum: AttendanceState })
  state?: AttendanceState;
}

export type AttendanceDocument = DocumentType<AttendanceSchema>;

const AttendanceModel: Model<AttendanceDocument> = getModelForClass(AttendanceSchema);

export function generateAttendanceDocumentFromDTO(dto: AttendanceDTO): AttendanceDocument {
  const date = startOfDay(new Date(dto.date));
  const attendance: TypegooseDocument<AttendanceSchema> = {
    date,
    state: dto.state || undefined,
    note: dto.note,
  };

  return new AttendanceModel(attendance);
}
