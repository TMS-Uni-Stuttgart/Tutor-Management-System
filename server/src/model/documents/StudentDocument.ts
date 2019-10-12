import { Document, Model, Types } from 'mongoose';
import { fieldEncryption } from 'mongoose-field-encryption';
import { PointMapDTO, PointId, PointMap } from 'shared/dist/model/Points';
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
  async getPointEntry(id: PointId): Promise<number> {
    const ownMap = new PointMap(this.points);
    const entry = ownMap.getPointEntry(id);

    if (entry) {
      return PointMap.getPointsOfEntry(entry);
    }

    if (!this.team) {
      return 0;
    }

    const team = await this.getTeam();
    const teamEntry = new PointMap(team.points).getPointEntry(id);

    return teamEntry ? PointMap.getPointsOfEntry(teamEntry) : 0;
  }
}

export interface StudentDocument extends StudentSchema, Document {}

const StudentModel: Model<StudentDocument> = new StudentSchema().getModelForClass(StudentSchema, {
  schemaOptions: { collection: CollectionName.STUDENT },
});

export default StudentModel;
