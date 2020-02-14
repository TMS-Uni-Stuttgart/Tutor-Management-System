import { DocumentType, modelOptions, plugin, prop, mapProp } from '@typegoose/typegoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import { CollectionName } from '../../../helpers/CollectionName';
import { StudentStatus } from '../../../shared/model/Student';
import { TutorialDocument } from '../../tutorial/tutorial.model';
import { AttendanceDocument, AttendanceModel } from './attendance.model';
import { TeamModel, TeamDocument } from './team.model';
import { GradingModel, GradingDocument } from './points.model';
import { HasExercises } from '../../../shared/model/Sheet';

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

  @mapProp({ of: GradingModel, autopopulate: true, default: new Map() })
  private gradings!: Map<string, GradingDocument>;

  /**
   * Saves the given attendance in the student.
   *
   * The attendance will be saved for it's date. If there is already an attendance saved for that date it will be overriden.
   *
   * This function marks the corresponding path as modified.
   *
   * @param attendance Attendance to set.
   */
  setAttendance(this: StudentDocument, attendance: AttendanceDocument) {
    this.attendances.set(this.getDateKey(attendance.date), attendance);

    // TODO: Needed?
    this.markModified('attendances');
  }

  /**
   * Returns the attendance of the given date if there is one saved. If not `undefined` is returned.
   *
   * @param date Date to look up
   * @returns Returns the attendance of the date or `undefined`.
   */
  getAttendance(date: Date): AttendanceDocument | undefined {
    return this.attendances.get(this.getDateKey(date));
  }

  /**
   * Saves the given grading for the given sheet.
   *
   * If there is already a saved grading for the given sheet the old one will get overridden.
   *
   * This function marks the corresponding path as modified.
   *
   * @param sheet Sheet to save grading for.
   * @param grading Grading so save.
   */
  setGrading(this: StudentDocument, sheet: HasExercises, grading: GradingDocument) {
    this.gradings.set(sheet.id, grading);

    // TODO: Needed?
    this.markModified('gradings');
  }

  /**
   * Returns the grading for the given sheet if one is saved. If not `undefined` is returned.
   *
   * @param sheet Sheet to get grading for.
   * @returns Grading for the given sheet or `undefined`
   */
  getGrading(sheet: HasExercises): GradingDocument | undefined {
    return this.gradings.get(sheet.id);
  }

  private getDateKey(date: Date): string {
    return date.toJSON();
  }
}

export type StudentDocument = DocumentType<StudentModel>;
