import { Type } from 'class-transformer';
import { HasId } from 'shared/model/Common';
import { ITeam } from 'shared/model/Team';
import { Modify } from '../typings/Modify';
import { HasGradings } from '../typings/types';
import { Grading } from './Grading';
import { StudentInTeam } from './Student';

interface Modified extends HasGradings {
  students: StudentInTeam[];
}

export class Team implements Modify<ITeam, Modified> {
  readonly id!: string;
  readonly teamNo!: number;
  readonly tutorial!: string;

  @Type(() => StudentInTeam)
  readonly students!: StudentInTeam[];

  /**
   * Returns the grading assigned to this team for the given entity.
   *
   * If no grading can be found that is assigned to this team for the given entity `undefined` is returned.
   *
   * 'Assigned to the team' means the grading is the one belonging to the team even in the case where the students of this team have different gradings.
   *
   * @param entity Entity (or ID) to get the grading for.
   * @returns Grading for the given entity if there is one, else `undefined`.
   */
  getGrading(entity: HasId | string): Grading | undefined {
    const gradings = this.getAllGradings(entity);

    if (gradings.length === 0) {
      return undefined;
    }

    if (gradings.length === 1) {
      return gradings[0];
    }

    return gradings.filter((grading) => grading.belongsToTeam)[0];
  }

  /**
   * Returns all gradings of students in this team related to the given entity.
   *
   * If all students share one grading the array only contains one item.
   *
   * However, if the students have different gradings for the given entity all of those gradings are returned.
   *
   * @param entity Entity to get the gradings for.
   * @returns List containing all gradings assigned to students of this team for the given entity.
   */
  getAllGradings(entity: HasId | string): Grading[] {
    if (this.students.length === 0) {
      return [];
    }

    const gradings = new Map<string, Grading>();
    this.students.forEach((student) => {
      const gradingOfStudent = student.getGrading(entity);

      if (gradingOfStudent) {
        gradings.set(gradingOfStudent.id, gradingOfStudent);
      }
    });

    return [...gradings.values()];
  }

  /**
   * @returns Team number as unified string with leading 0 if necessary.
   */
  getTeamNoAsString(): string {
    return this.teamNo.toString().padStart(2, '0');
  }

  /**
   * @returns Team name with unified team number and the lastnames of the students of the team.
   */
  toString(): string {
    const studentsInTeam = this.students.length
      ? `(${this.students.map((student) => student.lastname).join(', ')})`
      : '(Keine Studierende)';

    return `#${this.teamNo.toString().padStart(2, '0')} ${studentsInTeam}`;
  }
}
