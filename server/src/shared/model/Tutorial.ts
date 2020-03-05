import { HasId } from './Common';

export interface UserInEntity {
  id: string;
  firstname: string;
  lastname: string;
}

export interface ITutorialDTO {
  correctorIds: string[];
  dates: string[];
  endTime: string;
  slot: string;
  startTime: string;
  tutorId?: string | null;
}

export interface ITutorial extends HasId {
  slot: string;
  tutor?: UserInEntity;
  dates: string[];
  startTime: string;
  endTime: string;
  students: string[];
  teams: string[];
  correctors: UserInEntity[];
  substitutes: [string, UserInEntity][];
}

export interface ISubstituteDTO {
  tutorId?: string;
  dates: string[];
}
