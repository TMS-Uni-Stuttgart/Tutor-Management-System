import { Type } from 'class-transformer';
import { HasId } from 'shared/model/Common';
import { ITeam } from 'shared/model/Team';
import { Modify } from '../typings/Modify';
import { HasGradings } from '../typings/types';
import { Grading } from './Grading';
import { Student } from './Student';

interface Modified extends HasGradings {
  students: Student[];
}

export class Team implements Modify<ITeam, Modified> {
  readonly id!: string;
  readonly teamNo!: number;
  readonly tutorial!: string;

  @Type(() => Student)
  readonly students!: Student[];

  getGrading(entity: HasId | string): Grading | undefined {
    const gradings = this.getAllGradings(entity);

    if (!gradings || gradings.length === 0) {
      return undefined;
    }

    if (gradings.length === 1) {
      return gradings[0];
    }

    return gradings.filter((grading) => grading.belongsToTeam)[0];
  }

  private getAllGradings(entity: HasId | string): Grading[] | undefined {
    if (this.students.length === 0) {
      return;
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

  getTeamNoAsString(): string {
    return this.teamNo.toString().padStart(2, '0');
  }

  toString(): string {
    const studentsInTeam = this.students.length
      ? `(${this.students.map((student) => student.lastname).join(', ')})`
      : '(Keine Studierende)';

    return `#${this.teamNo.toString().padStart(2, '0')} ${studentsInTeam}`;
  }
}
