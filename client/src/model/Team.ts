import { Type } from 'class-transformer';
import { ITeam } from '../../../server/src/shared/model/Team';
import { Modify } from '../typings/Modify';
import { Student } from './Student';

interface Modified {
  students: Student[];
}

export class Team implements Modify<ITeam, Modified> {
  id!: string;
  teamNo!: number;
  tutorial!: string;

  @Type(() => Student)
  students!: Student[];

  getTeamNoAsString(): string {
    return this.teamNo.toString().padStart(2, '0');
  }
}
