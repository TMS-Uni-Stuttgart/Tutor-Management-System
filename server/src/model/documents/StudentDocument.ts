import { Document, Model, Types } from 'mongoose';
import { fieldEncryption } from 'mongoose-field-encryption';
import { PointMapDTO, PointId, PointMap, PointMapEntry } from 'shared/dist/model/Points';
import { Student } from 'shared/dist/model/Student';
import { mapProp, plugin, prop, Ref, Typegoose, instanceMethod } from '@hasezoey/typegoose';
import databaseConfig from '../../helpers/database';
import { CollectionName } from '../CollectionName';
import { AttendanceDocument, AttendanceSchema } from './AttendanceDocument';
import { TeamDocument } from './TeamDocument';
import { TutorialDocument } from './TutorialDocument';
import teamService from '../../services/team-service/TeamService.class';
import { getIdOfDocumentRef } from '../../helpers/documentHelpers';
import { isObject } from 'util';
import { SheetDocument } from './SheetDocument';
import { Sheet } from 'shared/dist/model/Sheet';

@plugin(fieldEncryption, {
  secret: databaseConfig.secret,
  fields: ['firstname', 'lastname', 'courseOfStudies', 'email', 'matriculationNo'],
})
export class StudentSchema extends Typegoose
  implements
    Omit<
      Student,
      | 'id'
      | 'tutorial'
      | 'team'
      | 'courseOfStudies'
      | 'email'
      | 'attendance'
      | 'points'
      | 'presentationPoints'
      | 'scheinExamResults'
    > {
  @prop({ required: true, ref: { name: 'TutorialSchema' } })
  tutorial!: Ref<TutorialDocument>;

  @prop({ required: true })
  firstname!: string;

  @prop({ required: true })
  lastname!: string;

  @prop({ required: true })
  matriculationNo!: string;

  @prop()
  email?: string;

  @prop()
  courseOfStudies?: string;

  @prop({ ref: { name: 'TeamSchema' } })
  team?: Ref<TeamDocument>;

  @mapProp({ of: AttendanceSchema })
  attendance?: Types.Map<AttendanceDocument>;

  @prop({ default: {} })
  points!: PointMapDTO;

  @mapProp({ of: Number })
  presentationPoints?: Types.Map<number>;

  @prop({ default: {} })
  scheinExamResults!: PointMapDTO;

  @instanceMethod
  async getTeam(): Promise<TeamDocument> {
    if (!this.team) {
      throw new Error('Can not get team because this student does not belong to a team.');
    }

    const [team] = await teamService.getDocumentWithId(
      getIdOfDocumentRef(this.tutorial),
      getIdOfDocumentRef(this.team)
    );

    return team;
  }

  @instanceMethod
  async getPoints(): Promise<PointMap> {
    if (!this.team) {
      return new PointMap(this.points);
    }

    const team = await this.getTeam();
    const points = new PointMap();
    const pointsOfTeam = new PointMap(team.points);
    const ownPoints = new PointMap(this.points);

    pointsOfTeam.getEntries().forEach(([key, entry]) => {
      points.setPointsByKey(key, entry);
    });

    ownPoints.getEntries().forEach(([key, entry]) => {
      points.setPointsByKey(key, entry);
    });

    return points;
  }

  @instanceMethod
  async getPointEntry(id: PointId): Promise<PointMapEntry | undefined> {
    const ownMap = new PointMap(this.points);
    const entry = ownMap.getPointEntry(id);

    if (entry) {
      return entry;
    }

    if (!this.team) {
      return undefined;
    }

    const team = await this.getTeam();
    const teamEntry = new PointMap(team.points).getPointEntry(id);

    return teamEntry;
  }

  @instanceMethod
  async getPointsOfExercise(id: PointId): Promise<number> {
    const entry = await this.getPointEntry(id);

    return entry ? PointMap.getPointsOfEntry(entry) : 0;
  }

  @instanceMethod
  getPresentationPointsOfSheet(sheet: Sheet): number {
    if (!this.presentationPoints) {
      return 0;
    }

    const pts = this.presentationPoints.get(sheet.id);

    return pts || 0;
  }

  @instanceMethod
  setAttendance(attendance: AttendanceDocument) {
    if (!this.attendance) {
      this.attendance = new Types.Map();
    }

    const date = attendance.date;
    this.attendance.set(date.toDateString(), attendance);
  }

  @instanceMethod
  getAttendanceOfDay(date: Date): AttendanceDocument | undefined {
    if (!this.attendance) {
      return undefined;
    }

    return this.attendance.get(date.toDateString());
  }
}

export interface StudentDocument extends StudentSchema, Document {}

const StudentModel: Model<StudentDocument> = new StudentSchema().getModelForClass(StudentSchema, {
  schemaOptions: { collection: CollectionName.STUDENT },
});

export default StudentModel;
