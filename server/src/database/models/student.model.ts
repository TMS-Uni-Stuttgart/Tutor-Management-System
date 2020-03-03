import {
  DocumentType,
  mapProp,
  modelOptions,
  plugin,
  prop,
  arrayProp,
  post,
} from '@typegoose/typegoose';
import { DateTime } from 'luxon';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import { EncryptedDocument, fieldEncryption } from 'mongoose-field-encryption';
import { CollectionName } from '../../helpers/CollectionName';
import { databaseConfig } from '../../helpers/config';
import { Attendance } from '../../shared/model/Attendance';
import { Grading } from '../../shared/model/Points';
import { Student, StudentStatus } from '../../shared/model/Student';
import { AttendanceDocument, AttendanceModel } from './attendance.model';
import { HasExerciseDocuments } from './exercise.model';
import { GradingDocument, GradingModel } from './grading.model';
import { SheetDocument } from './sheet.model';
import { TeamDocument, TeamModel } from './team.model';
import { TutorialDocument } from './tutorial.model';

interface ConstructorFields {
  firstname: string;
  lastname: string;
  tutorial: TutorialDocument;
  team?: TeamDocument;
  matriculationNo?: string;
  email?: string;
  courseOfStudies?: string;
  status: StudentStatus;
  cakeCount: number;
}

function loadGradingMap(doc: StudentModel | null) {
  if (!doc) {
    return;
  }

  doc.loadGradingMap();
}

@plugin(fieldEncryption, {
  secret: databaseConfig.secret,
  fields: ['firstname', 'lastname', 'courseOfStudies', 'email', 'matriculationNo', 'status'],
})
@plugin(mongooseAutoPopulate)
@post<StudentModel>('find', function(result) {
  result.forEach(loadGradingMap);
})
@post<StudentModel>('findOne', loadGradingMap)
@modelOptions({ schemaOptions: { collection: CollectionName.STUDENT } })
export class StudentModel {
  constructor(fields: ConstructorFields) {
    Object.assign(this, fields);

    this.attendances = new Map();
    this.gradings = new Map();
    this.presentationPoints = new Map();
  }

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
  attendances!: Map<string, AttendanceDocument>;

  @arrayProp({ ref: GradingModel, autopopulate: true, default: [] })
  private _gradings!: GradingDocument[];

  private gradings!: Map<string, GradingDocument>;

  @mapProp({ of: Number, default: new Map() })
  presentationPoints!: Map<string, number>;

  /**
   * Loads all documents saved as references in the database to be in an actual Map.
   *
   * This will clear the previously set map.
   */
  loadGradingMap() {
    this.gradings = new Map();

    for (const doc of this._gradings) {
      this.gradings.set(doc.sheetId, doc);
    }
  }

  /**
   * Saves all documents currently saved in the gradings map into the array for the database.
   *
   * This will empty the array first and mark the corresponding path as modified afterwards.
   */
  private saveGradingMap(this: StudentDocument) {
    this._gradings.splice(0);

    for (const [, value] of this.gradings) {
      this._gradings.push(value);
    }

    this.markModified('_gradings');
  }

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
   * Saves the given grading for the given sheet.
   *
   * If there is already a saved grading for the given sheet the old one will get overridden.
   *
   * This function marks the corresponding path as modified.
   *
   * @param sheet Sheet to save grading for.
   * @param grading Grading so save.
   */
  setGrading(this: StudentDocument, sheet: HasExerciseDocuments, grading: GradingDocument) {
    if (!sheet.id) {
      throw new Error('Given sheet needs to have an id field.');
    }

    this.gradings.set(sheet.id, grading);
    this.saveGradingMap();
  }

  /**
   * Returns the grading for the given sheet if one is saved. If not `undefined` is returned.
   *
   * @param sheet Sheet to get grading for.
   *
   * @returns Grading for the given sheet or `undefined`
   */
  getGrading(sheet: HasExerciseDocuments): GradingDocument | undefined {
    if (!sheet.id) {
      return undefined;
    }

    return this.gradings.get(sheet.id);
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
  setPresentationPoints(this: StudentDocument, sheet: SheetDocument, points: number) {
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
  toDTO(this: StudentDocument): Student {
    this.decryptFieldsSync();

    const {
      id,
      firstname,
      lastname,
      matriculationNo,
      cakeCount,
      tutorial,
      email,
      courseOfStudies,
      status,
      team,
    } = this;

    const presentationPoints = [...this.presentationPoints];
    const attendances: Map<string, Attendance> = new Map();
    const gradings: Map<string, Grading> = new Map();

    for (const [key, doc] of this.attendances.entries()) {
      attendances.set(key, doc.toDTO());
    }

    for (const [key, doc] of this.gradings.entries()) {
      gradings.set(key, doc.toDTO());
    }

    return {
      id,
      firstname,
      lastname,
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
    return date.toISODate();
  }
}

export type StudentDocument = EncryptedDocument<DocumentType<StudentModel>>;
