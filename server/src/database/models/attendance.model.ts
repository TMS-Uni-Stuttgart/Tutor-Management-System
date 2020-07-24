import { DocumentType, getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { DateTime } from 'luxon';
import { AttendanceDTO } from '../../module/student/student.dto';
import { AttendanceState, IAttendance } from '../../shared/model/Attendance';

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
    const parsed = date.toISODate();

    if (!!parsed) {
      this._date = parsed;
    }
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

  toDTO(this: AttendanceDocument): IAttendance {
    const { date, note, state } = this;
    const parsedDate = date.toISODate();

    if (!parsedDate) {
      throw new Error(`Inner date object could not be parsed to ISODate.`);
    }

    return {
      date: parsedDate,
      note,
      state,
    };
  }
}

export type AttendanceDocument = DocumentType<AttendanceModel>;
