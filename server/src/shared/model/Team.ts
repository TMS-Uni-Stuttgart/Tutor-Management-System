import { HasId } from './Common';
import { IStudent } from './Student';

export interface ITeamId {
  tutorialId: string;
  teamId: string;
}

export interface ITeam extends HasId {
  students: IStudent[];
  teamNo: number;
  tutorial: string;
}

export interface ITeamDTO {
  students: string[];
}
