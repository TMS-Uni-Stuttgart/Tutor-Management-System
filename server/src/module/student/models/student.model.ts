import { DocumentType, modelOptions, plugin, prop, mapProp } from '@typegoose/typegoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import { CollectionName } from '../../../helpers/CollectionName';
import { StudentStatus } from '../../../shared/model/Student';
import { TutorialDocument } from '../../tutorial/tutorial.model';
import { AttendanceDocument, AttendanceModel } from './attendance.model';
import { TeamModel, TeamDocument } from './team.model';

@plugin(mongooseAutoPopulate)
@modelOptions({ schemaOptions: { collection: CollectionName.STUDENT } })
export class StudentModel {
  @prop({ required: true })
  firstname!: string;

  @prop({ required: true })
  lastname!: string;

  @prop({ required: true, ref: 'TutorialModel', autopopulate: true })
  tutorial!: TutorialDocument;

  @prop({ ref: TeamModel, autopopulate: true })
  team?: TeamDocument;

  @prop()
  matriculationNo?: string;

  @prop()
  email?: string;

  @prop()
  courseOfStudies?: string;

  @prop({ default: StudentStatus.ACTIVE })
  status!: StudentStatus;

  @prop({ default: 0 })
  cakeCount!: number;

  @mapProp({ of: AttendanceModel, autopopulate: true, default: new Map() })
  private attendances!: Map<string, AttendanceDocument>;

  // TODO: Points, Scheinexam results (merged with points) & Presentations

  setAttendance(attendance: AttendanceDocument) {
    this.attendances.set(this.getDateKey(attendance.date), attendance);
  }

  getAttendance(date: Date): AttendanceDocument | undefined {
    return this.attendances.get(this.getDateKey(date));
  }

  private getDateKey(date: Date): string {
    return date.toJSON();
  }
}

export type StudentDocument = DocumentType<StudentModel>;
