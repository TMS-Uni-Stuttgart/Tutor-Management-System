import { HasId } from './Common';
import { Student } from './Student';

export interface Team extends HasId {
  students: Student[];
  teamNo: number;
  tutorial: string;
}

export interface ITeamDTO {
  students: string[];
}
