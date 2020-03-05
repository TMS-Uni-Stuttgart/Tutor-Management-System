import { HasId } from './Common';

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
  tutor?: string;
  dates: string[];
  startTime: string;
  endTime: string;
  students: string[];
  teams: string[];
  correctors: string[];
  substitutes: [string, string][];
}

export interface ISubstituteDTO {
  tutorId?: string;
  dates: string[];
}
