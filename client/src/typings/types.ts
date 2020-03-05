import { HasId } from 'shared/model/Common';
import { ScheinCriteriaSummary } from 'shared/model/ScheinCriteria';
import { Student } from 'shared/model/Student';
import { Tutorial } from 'shared/model/Tutorial';
import { User } from 'shared/model/User';

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

export interface StudentByTutorialSlotSummaryMap {
  [tutorialSlot: string]: ScheinCriteriaSummary[];
}
