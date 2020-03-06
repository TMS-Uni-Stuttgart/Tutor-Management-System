import { Type } from 'class-transformer';
import { ITeam } from '../../../server/src/shared/model/Team';
import { Modify } from '../typings/Modify';
import { Student } from './Student';
import { HasGradings } from '../typings/types';
import { HasId } from '../../../server/src/shared/model/Common';
import { Grading } from './Grading';

interface Modified extends HasGradings {
  students: Student[];
}

export class Team implements Modify<ITeam, Modified> {
  id!: string;
  teamNo!: number;
  tutorial!: string;

  @Type(() => Student)
  students!: Student[];

  getGrading(entity: HasId | string): Grading | undefined {
    if (this.students.length === 0) {
      return undefined;
    }

    let gradingId: string | undefined;

    for (const student of this.students) {
      const grading = student.getGrading(entity);

      if (!gradingId) {
        gradingId = grading?.id;
      }

      if (gradingId !== grading?.id) {
        // TODO: What to do if students have different gradings?
        throw new Error('Students of team have different gradings');
      }
    }

    return this.students[0].getGrading(entity);
  }

  getTeamNoAsString(): string {
    return this.teamNo.toString().padStart(2, '0');
  }

  toString(): string {
    const studentsInTeam = this.students.length
      ? `(${this.students.map(student => student.lastname).join(', ')})`
      : '(Keine Studierende)';

    return `#${this.teamNo.toString().padStart(2, '0')} ${studentsInTeam}`;
  }
}
