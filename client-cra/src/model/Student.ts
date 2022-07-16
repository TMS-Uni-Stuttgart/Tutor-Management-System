import { Transform, Type } from 'class-transformer';
import { DateTime } from 'luxon';
import { IAttendance } from 'shared/model/Attendance';
import { HasId, ITutorialInEntity } from 'shared/model/Common';
import { IStudent, StudentStatus, TeamInStudent } from 'shared/model/Student';
import { IStudentInTeam } from 'shared/model/Team';
import { getNameOfEntity } from 'shared/util/helpers';
import { Modify } from '../typings/Modify';
import { HasGradings } from '../typings/types';
import { parseDateToMapKey } from '../util/helperFunctions';
import { Grading } from './Grading';
import { Sheet } from './Sheet';

interface Modified extends HasGradings {
  attendances: Map<string, IAttendance>;
  presentationPoints: Map<string, number>;
  gradings: Map<string, Grading>;
}

export class StudentInTeam implements Modify<IStudentInTeam, Modified> {
  readonly id!: string;
  readonly firstname!: string;
  readonly lastname!: string;
  readonly iliasName!: string;

  @Type(() => Grading)
  @Transform(({ value }) => new Map(value))
  readonly gradings!: Map<string, Grading>;

  @Type(() => Object)
  @Transform(({ value }) => new Map(value))
  readonly attendances!: Map<string, IAttendance>;

  @Transform(({ value }) => new Map(value))
  readonly presentationPoints!: Map<string, number>;

  readonly courseOfStudies?: string;
  readonly email?: string;
  readonly matriculationNo?: string;
  readonly status!: StudentStatus;
  readonly team?: TeamInStudent;

  cakeCount!: number;

  /**
   * @return Name of the student in the format 'lastname, firstname'.
   */
  get name(): string {
    return getNameOfEntity(this);
  }

  /**
   * @returns Name of the student in the format 'firstname lastname'.
   */
  get nameFirstnameFirst(): string {
    return getNameOfEntity(this, { firstNameFirst: true });
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

export class Student extends StudentInTeam implements Modify<IStudent, Modified> {
  readonly tutorial!: ITutorialInEntity;
}
