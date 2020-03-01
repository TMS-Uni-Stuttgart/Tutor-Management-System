import { DocumentType, modelOptions, prop, getModelForClass } from '@typegoose/typegoose';
import { DateTime } from 'luxon';
import { AttendanceState, Attendance } from '../../shared/model/Attendance';
import { AttendanceDTO } from '../../module/student/student.dto';

interface ConstructorFields {
  date: Date | string;
  note?: string;
  state?: AttendanceState;
}

@modelOptions({})
export class AttendanceModel {
  constructor({ date, note, state }: ConstructorFields) {
    this.date = date instanceof Date ? DateTime.fromJSDate(date) : DateTime.fromISO(date);
    this.note = note;
    this.state = state;
  }

  @prop({ required: true })
  private _date!: string;

  get date(): DateTime {
    return DateTime.fromISO(this._date);
  }

  set date(date: DateTime) {
    this._date = date.toISODate();
  }

  @prop()
  note?: string;

  @prop({ enum: AttendanceState })
  state?: AttendanceState;

  static fromDTO(dto: AttendanceDTO): AttendanceDocument {
    const model = getModelForClass(AttendanceModel);
    const attendance = new AttendanceModel(dto);

    return new model(attendance);
  }

  toDTO(this: AttendanceDocument): Attendance {
    const { date, note, state } = this;

    return {
      date: date.toISODate(),
      note,
      state,
    };
  }
}

export type AttendanceDocument = DocumentType<AttendanceModel>;
