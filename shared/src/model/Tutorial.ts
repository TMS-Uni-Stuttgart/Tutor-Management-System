import { HasId } from './Common';

export interface TutorialDTO {
  correctorIds: string[];
  dates: string[];
  endTime: string;
  slot: number;
  startTime: string;
  tutorId?: string | null;
}

export interface Tutorial extends HasId {
  slot: number;
  tutor?: string;
  dates: Date[];
  startTime: Date;
  endTime: Date;
  students: string[];
  teams: string[];
  correctors: string[];
  substitutes: { [index: string]: string };
}

export interface LoggedInUserTutorial extends HasId {
  slot: number;
}

export interface LoggedInUserSubstituteTutorial extends LoggedInUserTutorial {
  dates: Date[];
}
