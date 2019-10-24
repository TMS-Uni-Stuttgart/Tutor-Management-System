import { HasId } from './Common';

export interface TutorialDTO {
  correctorIds: string[];
  dates: string[];
  endTime: string;
  slot: string;
  startTime: string;
  tutorId?: string | null;
}

export interface Tutorial extends HasId {
  slot: string;
  tutor?: string;
  dates: Date[];
  startTime: Date;
  endTime: Date;
  students: string[];
  teams: string[];
  correctors: string[];
  substitutes: { [index: string]: string };
}

export interface SubstituteDTO {
  tutorId?: string;
  dates: string[];
}

export interface LoggedInUserTutorial extends HasId {
  slot: string;
}

export interface LoggedInUserSubstituteTutorial extends LoggedInUserTutorial {
  dates: string[];
}
