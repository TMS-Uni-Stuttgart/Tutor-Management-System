import { HasId } from 'shared/dist/model/Common';
import { PointMap, PointMapDTO } from 'shared/dist/model/Points';
import { ScheinCriteriaSummary } from 'shared/dist/model/ScheinCriteria';
import { Student } from 'shared/dist/model/Student';
import { Tutorial } from 'shared/dist/model/Tutorial';
import { User } from 'shared/dist/model/User';

export interface UserWithFetchedTutorials extends Omit<User, 'tutorials' | 'tutorialsToCorrect'> {
  tutorials: Tutorial[];
  tutorialsToCorrect: Tutorial[];
}

export interface TutorialWithFetchedTutor extends Omit<Tutorial, 'tutor'> {
  tutor?: User;
}

export interface TutorialWithFetchedStudents extends Omit<Tutorial, 'students'> {
  // tutor?: User;
  students: Student[];
}

export interface TutorialWithFetchedCorrectors extends Omit<Tutorial, 'tutor' | 'correctors'> {
  tutor?: User;
  correctors: User[];
}

// FIXME: Remove me after replaced everywhere.
export type StudentWithFetchedTeam = Student;

export interface HasPoints extends HasId {
  points: PointMapDTO;
}

export interface StudentScheinCriteriaSummaryMap {
  [id: string]: ScheinCriteriaSummary;
}

export interface StudentByTutorialSlotSummaryMap {
  [tutorialSlot: string]: ScheinCriteriaSummary[];
}
