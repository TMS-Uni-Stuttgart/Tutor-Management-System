import { HasId } from './Common';

export interface Tutorial extends HasId {
  correctors: string[];
  dates: Date[];
  endTime: Date;
  slot: number;
  startTime: Date;
  students: string[];
  substitutes: { [index: string]: string };
  teams: string[];
  tutor?: string;
}

export interface LoggedInUserTutorial extends HasId {
  slot: number;
}

export interface LoggedInUserSubstituteTutorial extends LoggedInUserTutorial {
  dates: Date[];
}
