import { Type, Transform } from 'class-transformer';
import { DateTime } from 'luxon';
import { IAttendance } from '../../../server/src/shared/model/Attendance';
import { HasId, TutorialInEntity } from '../../../server/src/shared/model/Common';
import { IStudent, StudentStatus, TeamInStudent } from '../../../server/src/shared/model/Student';
import { getNameOfEntity } from '../../../server/src/shared/util/helpers';
import { Modify } from '../typings/Modify';
import { parseDateToMapKey } from '../util/helperFunctions';
import { Grading } from './Grading';
import { Sheet } from './Sheet';
import { HasGradings } from '../typings/types';

interface Modified extends HasGradings {
  attendances: Map<string, IAttendance>;
  presentationPoints: Map<string, number>;
  gradings: Map<string, Grading>;
}

export class Student implements Modify<IStudent, Modified> {
  readonly id!: string;
  readonly firstname!: string;
  readonly lastname!: string;

  @Type(() => Grading)
  @Transform(value => new Map(value))
  readonly gradings!: Map<string, Grading>;

  @Type(() => Object)
  @Transform(value => new Map(value))
  readonly attendances!: Map<string, IAttendance>;

  @Transform(value => new Map(value))
  readonly presentationPoints!: Map<string, number>;

  readonly courseOfStudies?: string;
  readonly email?: string;
  readonly matriculationNo?: string;
  readonly status!: StudentStatus;
  readonly team?: TeamInStudent;
  readonly tutorial!: TutorialInEntity;

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
   * @param sheet Sheet or the sheet ID to get the grading for.
   *
   * @returns Grading for the sheet or `undefined`.
   */
  getGrading(sheet: HasId | string): Grading | undefined {
    if (typeof sheet === 'string') {
      return this.gradings.get(sheet);
    } else {
      return this.gradings.get(sheet.id);
    }
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

  /**
   * @returns Sum of all presentation points of this student.
   */
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
