import { HasId } from './Common';
import { IStudent } from './Student';

export interface ITeamId {
    tutorialId: string;
    teamId: string;
}

export type IStudentInTeam = Omit<IStudent, 'tutorial'>;

export interface ITeam extends HasId {
    students: IStudentInTeam[];
    teamNo: number;
    tutorial: string;
}

export interface ITeamDTO {
    students: string[];
}

export interface ITeamInEntity {
    id: string;
    teamNo: number;
}
