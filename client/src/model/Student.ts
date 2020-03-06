import { Type } from 'class-transformer';
import { DateTime } from 'luxon';
import { IAttendance } from '../../../server/src/shared/model/Attendance';
import { TutorialInEntity } from '../../../server/src/shared/model/Common';
import { HasExercises } from '../../../server/src/shared/model/Sheet';
import { IStudent, StudentStatus, TeamInStudent } from '../../../server/src/shared/model/Student';
import { getNameOfEntity } from '../../../server/src/shared/util/helpers';
import { Modify } from '../typings/Modify';
import { parseDateToMapKey } from '../util/helperFunctions';
import { Grading } from './Grading';
import { Sheet } from './Sheet';

interface Modified {
  attendances: Map<string, IAttendance>;
  gradings: Map<string, Grading>;
  presentationPoints: Map<string, number>;
}

export class Student implements Modify<IStudent, Modified> {
  id!: string;
  firstname!: string;
  lastname!: string;

  @Type(() => Grading)
  gradings!: Map<string, Grading>;

  attendances!: Map<string, IAttendance>;
  presentationPoints!: Map<string, number>;

  courseOfStudies?: string;
  email?: string;
  matriculationNo?: string;
  status!: StudentStatus;
  team?: TeamInStudent;
  tutorial!: TutorialInEntity;
  cakeCount!: number;

  get name(): string {
    return getNameOfEntity(this);
  }

  /**
   * Returns the attendance of the given date. If there is none `undefined` is returned.
   *
   * @param date Date to get attendance for.
   *
   * @returns Attendance of the given date or `undefined`.
   */
  getAttendance(date: DateTime): IAttendance | undefined {
    return this.attendances.get(parseDateToMapKey(date));
  }

  /**
   * Returns the grading of the given sheet if the student has one. If not `undefined` is returned.
   *
   * @param sheet Sheet to get the grading for.
   *
   * @returns Grading for the sheet or `undefined`.
   */
  getGrading(sheet: HasExercises): Grading | undefined {
    return this.gradings.get(sheet.id);
  }

  /**
   * Returns the presentation points of the given sheet if the student has any. If not `undefined` is returned.
   *
   * @param sheet Sheet to get the presentation points for.
   *
   * @returns Presentation points for the sheet or `undefined`.
   */
  getPresentationPoints(sheet: Sheet): number | undefined {
    return this.presentationPoints.get(sheet.id);
  }

  getPresentationPointsSum(): number {
    let sum = 0;

    for (const value of this.presentationPoints.values()) {
      sum += value;
    }

    return sum;
  }

  /**
   * Returns a string for the team of this students.
   *
   * It is either:
   * - 'Team XX' if the student is in a team (where 'XX' is the number) or
   * - 'Ohne Team' if the student is NOT in a team.
   */
  getTeamString(): string {
    if (!this.team) {
      return 'Ohne Team';
    }

    return `Team ${this.team.teamNo.toString().padStart(2, '0')}`;
  }
}
