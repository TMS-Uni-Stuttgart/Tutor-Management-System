export interface Attendance {
  date: Date;
  id: AttendanceId;
  note?: string;
  state?: AttendanceState;
}

export interface AttendanceId {
  date: Date;
  studentId: string;
}

export interface Exercise {
  bonus: boolean;
  exNo: number;
  maxPoints: number;
}

export interface HasId {
  _id: string;
}

export interface LoggedInUser extends NamedElement {
  hasTemporaryPassword: boolean;
  roles: Role[];
  substituteTutorials: LoggedInUserSubstituteTutorial[];
  tutorials: LoggedInUserTutorial[];
}

export interface LoggedInUserSubstituteTutorial {
  dates: Date[];
  id: string;
  slot: number;
}

export interface LoggedInUserTutorial {
  id: string;
  slot: number;
}

export interface NamedElement extends HasId {
  firstname: string;
  lastname: string;
}

export interface ScheinCriteriaAdditionalStatus {
  achieved: number;
  no: number;
  state: PassedState;
  total: number;
  unit: ScheinCriteriaUnit;
}

export interface ScheinCriteriaStatus {
  achieved: number;
  id: string;
  identifier: string;
  infos: { [index: string]: ScheinCriteriaAdditionalStatus };
  name: string;
  passed: boolean;
  total: number;
  unit: ScheinCriteriaUnit;
}

export interface ScheinCriteriaSummary {
  passed: boolean;
  scheinCriteriaSummary: { [index: string]: ScheinCriteriaStatus };
}

export interface ScheinExam extends HasId {
  date: Date;
  exercises: Exercise[];
  percentageNeeded: number;
  scheinExamNo: number;
}

export interface Student extends NamedElement {
  attendance: { [index: string]: Attendance };
  courseOfStudies: string;
  email: string;
  matriculationNo: string;
  points: { [index: string]: number };
  presentationPoints: { [index: string]: number };
  scheinExamResults: { [index: string]: number };
  team?: string;
  tutorial: string;
}

export interface Team extends HasId {
  points: { [index: string]: number };
  students: Student[];
  teamNo: number;
  tutorial: string;
}

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

export interface User extends NamedElement {
  roles: Role[];
  temporaryPassword: string;
  tutorials: string[];
  username: string;
}

export enum AttendanceState {
  PRESENT = 'PRESENT',
  EXCUSED = 'EXCUSED',
  UNEXCUSED = 'UNEXCUSED',
}

export enum PassedState {
  PASSED = 'PASSED',
  NOTPASSED = 'NOTPASSED',
  IGNORE = 'IGNORE',
}

export enum Role {
  ADMIN = 'ADMIN',
  CORRECTOR = 'CORRECTOR',
  EMPLOYEE = 'EMPLOYEE',
  TUTOR = 'TUTOR',
}

export enum ScheinCriteriaUnit {
  SHEET = 'SHEET',
  POINT = 'POINT',
  EXAM = 'EXAM',
  PRESENTATION = 'PRESENTATION',
  DATE = 'DATE',
}
