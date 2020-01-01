import {
  instanceMethod,
  InstanceType,
  mapProp,
  plugin,
  prop,
  Ref,
  Typegoose,
} from '@typegoose/typegoose';
import { Document, Model, Types } from 'mongoose';
import { fieldEncryption } from 'mongoose-field-encryption';
import { PointId, PointMap, PointMapDTO, PointMapEntry } from 'shared/dist/model/Points';
import { Sheet } from 'shared/dist/model/Sheet';
import { Student, StudentStatus } from 'shared/dist/model/Student';
import { databaseConfig } from '../../helpers/config';
import { getIdOfDocumentRef } from '../../helpers/documentHelpers';
import Logger from '../../helpers/Logger';
import teamService from '../../services/team-service/TeamService.class';
import { CollectionName } from '../CollectionName';
import { AttendanceDocument, AttendanceSchema } from './AttendanceDocument';
import { TeamDocument } from './TeamDocument';
import { TutorialDocument } from './TutorialDocument';

@plugin(fieldEncryption, {
  secret: databaseConfig.secret,
  fields: ['firstname', 'lastname', 'courseOfStudies', 'email', 'matriculationNo', 'status'],
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

  @prop()
  matriculationNo?: string;

  @prop()
  email?: string;

  @prop()
  courseOfStudies?: string;

  @prop({ ref: { name: 'TeamSchema' } })
  team?: Ref<TeamDocument> | null;

  @prop({ default: StudentStatus.ACTIVE })
  status!: StudentStatus;

  @mapProp({ of: AttendanceSchema })
  attendance?: Types.Map<AttendanceDocument>;

  @prop({ default: {} })
  points!: PointMapDTO;

  @mapProp({ of: Number })
  presentationPoints?: Types.Map<number>;

  @prop({ default: {} })
  scheinExamResults!: PointMapDTO;

  @prop({ default: 0 })
  cakeCount!: number;

  @instanceMethod
  async getTeam(this: InstanceType<StudentSchema>): Promise<TeamDocument | undefined> {
    if (!this.team) {
      return undefined;
    }

    try {
      const [team] = await teamService.getDocumentWithId(
        getIdOfDocumentRef(this.tutorial),
        getIdOfDocumentRef(this.team)
      );

      return team;
    } catch {
      Logger.error(
        `[StudentDocument] Team with ID ${this.team.toString()} does not exist in the DB (anymore). It gets removed from the student.`
      );

      this.team = undefined;
      await this.save();

      return undefined;
    }
  }

  @instanceMethod
  async getPoints(this: InstanceType<StudentSchema>): Promise<PointMap> {
    const team = await this.getTeam();

    if (!team) {
      return new PointMap(this.points);
    }

    const points = new PointMap();
    const pointsOfTeam = new PointMap(team.points);
    const ownPoints = new PointMap(this.points);

    pointsOfTeam.getEntries().forEach(([key, entry]) => {
      points.setPointEntryByKey(key, entry);
    });

    ownPoints.getEntries().forEach(([key, entry]) => {
      points.setPointEntryByKey(key, entry);
    });

    return points;
  }

  @instanceMethod
  async getPointEntry(
    this: InstanceType<StudentSchema>,
    id: PointId
  ): Promise<PointMapEntry | undefined> {
    const ownMap = new PointMap(this.points);
    const entry = ownMap.getPointEntry(id);

    if (entry) {
      return entry;
    }

    const team = await this.getTeam();

    if (!team) {
      return undefined;
    }

    const teamEntry = new PointMap(team.points).getPointEntry(id);

    return teamEntry;
  }

  @instanceMethod
  async getPointsOfExercise(this: InstanceType<StudentSchema>, id: PointId): Promise<number> {
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
