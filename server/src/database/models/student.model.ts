import { DocumentType, modelOptions, plugin, prop } from '@typegoose/typegoose';
import { DateTime } from 'luxon';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import { EncryptedDocument, fieldEncryption } from 'mongoose-field-encryption';
import { CollectionName } from '../../helpers/CollectionName';
import { StaticSettings } from '../../module/settings/settings.static';
import { IAttendance } from '../../shared/model/Attendance';
import { IGrading } from '../../shared/model/Gradings';
import { IStudent, StudentStatus } from '../../shared/model/Student';
import { AttendanceDocument, AttendanceModel } from './attendance.model';
import { HandInDocument } from './exercise.model';
import { GradingDocument, GradingModel } from './grading.model';
import { SheetDocument } from './sheet.model';
import { TeamDocument, TeamModel } from './team.model';
import { TutorialDocument } from './tutorial.model';

interface ConstructorFields {
  firstname: string;
  lastname: string;
  iliasName?: string;
  tutorial: TutorialDocument;
  team?: TeamDocument;
  matriculationNo?: string;
  email?: string;
  courseOfStudies?: string;
  status: StudentStatus;
  cakeCount: number;
}

@plugin(fieldEncryption, {
  secret: StaticSettings.getService().getDatabaseSecret(),
  fields: [
    'firstname',
    'lastname',
    'iliasName',
    'courseOfStudies',
    'email',
    'matriculationNo',
    'status',
  ],
})
@plugin(mongooseAutoPopulate)
@modelOptions({ schemaOptions: { collection: CollectionName.STUDENT } })
export class StudentModel {
  constructor(fields: ConstructorFields) {
    Object.assign(this, fields);

    this.attendances = new Map();
    this.presentationPoints = new Map();
  }

  @prop({ required: true })
  firstname!: string;

  @prop({ required: true })
  lastname!: string;

  @prop()
  iliasName?: string;

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

  @prop({ type: AttendanceModel, autopopulate: true, default: new Map() })
  attendances!: Map<string, AttendanceDocument>;

  @prop({ type: GradingModel, autopopulate: { autopopulate: false }, default: [] })
  private ownGradings!: GradingDocument[];

  @prop({ type: Number, default: new Map() })
  presentationPoints!: Map<string, number>;

  /**
   * Saves the given attendance in the student.
   *
   * The attendance will be saved for it's date. If there is already an attendance saved for that date it will be overriden.
   *
   * This function marks the corresponding path as modified.
   *
   * @param attendance Attendance to set.
   */
  setAttendance(this: StudentDocument, attendance: AttendanceDocument): void {
    this.attendances.set(this.getDateKey(attendance.date), attendance);
    this.markModified('attendances');
  }

  /**
   * Returns the attendance of the given date if there is one saved. If not `undefined` is returned.
   *
   * @param date Date to look up
   *
   * @returns Returns the attendance of the date or `undefined`.
   */
  getAttendance(date: DateTime): AttendanceDocument | undefined {
    return this.attendances.get(this.getDateKey(date));
  }

  /**
   * Saves the given grading for the given hand-in.
   *
   * If there is already a saved grading for the given hand-in the old one will get replaced.
   *
   * This function marks the corresponding path as modified.
   *
   * @param sheet Sheet to save grading for.
   * @param grading Grading so save.
   */
  setGrading(this: StudentDocument, handIn: HandInDocument, grading: GradingDocument): void {
    if (!handIn.id) {
      return;
    }

    const idx = this.ownGradings.findIndex((grad) => grad.entityId === handIn.id);

    if (idx === -1) {
      this.ownGradings.push(grading);
    } else {
      this.ownGradings[idx] = grading;
    }

    // FIXME: If one renames the 'ownGrading' property update this one aswell!
    this.markModified('ownGradings');
  }

  /**
   * Returns the grading for the given hand-in if one is saved, if not `undefined` is returned.
   *
   * @param handIn hand-in to get grading for.
   *
   * @returns Grading for the given hand-in or `undefined`
   */
  getGrading(handIn: HandInDocument): GradingDocument | undefined {
    if (!handIn.id) {
      return undefined;
    }

    return this.ownGradings.find((grad) => grad.entityId === handIn.id);
  }

  /**
   * Saves the given presentation points for the given sheet.
   *
   * If there are already saved presentation points for the given sheet the old ones will get overridden.
   *
   * This function marks the corresponding path as modified.
   *
   * @param sheet Sheet to save grading for.
   * @param points Presentation points to save.
   */
  setPresentationPoints(this: StudentDocument, sheet: SheetDocument, points: number): void {
    this.presentationPoints.set(sheet.id, points);
    this.markModified('presentationPoints');
  }

  /**
   * Returns the presentation points for the given sheet if there are any saved. If not `undefined` is returned.
   *
   * @param sheet Sheet to get presentation points for.
   *
   * @returns Presentation points for the given sheet or `undefined`.
   */
  getPresentationPoints(this: StudentDocument, sheet: SheetDocument): number | undefined {
    return this.presentationPoints.get(sheet.id);
  }

  /**
   * @returns The DTO representation of this document.
   */
  toDTO(this: StudentDocument): IStudent {
    this.decryptFieldsSync();

    const {
      id,
      firstname,
      lastname,
      iliasName,
      matriculationNo,
      cakeCount,
      tutorial,
      email,
      courseOfStudies,
      status,
      team,
    } = this;

    const presentationPoints = [...this.presentationPoints];
    const attendances: Map<string, IAttendance> = new Map();
    const gradings: Map<string, IGrading> = new Map();

    for (const [key, doc] of this.attendances) {
      attendances.set(key, doc.toDTO());
    }

    for (const doc of this.ownGradings) {
      gradings.set(doc.entityId, doc.toDTO());
    }

    return {
      id,
      firstname,
      lastname,
      iliasName,
      matriculationNo,
      tutorial: { id: tutorial.id, slot: tutorial.slot },
      team: team && {
        id: team.id,
        teamNo: team.teamNo,
      },
      status,
      courseOfStudies,
      attendances: [...attendances],
      cakeCount,
      email,
      gradings: [...gradings],
      presentationPoints,
    };
  }

  private getDateKey(date: DateTime): string {
    const dateKey = date.toISODate();

    if (!dateKey) {
      throw new Error(`Date '${date}' is not parseable to an ISODate.`);
    }

    return dateKey;
  }
}

export type StudentDocument = EncryptedDocument<DocumentType<StudentModel>>;
