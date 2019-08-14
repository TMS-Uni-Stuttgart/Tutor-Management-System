import { Exercise } from './RatingModel';
import { HasId, Student, Team, Tutorial, User } from './ServerResponses';
import { ScheinCriteriaSummary } from '../typings/ServerResponses';

export interface UserWithFetchedTutorials extends Omit<User, 'tutorials'> {
  tutorials: Tutorial[];
}

export interface TutorialWithFetchedTutor extends Omit<Tutorial, 'tutor'> {
  tutor?: User;
}

export interface TutorialWithFetchedStudents extends Omit<Tutorial, 'tutor' | 'students'> {
  tutor?: User;
  students: Student[];
}

export interface TutorialWithFetchedCorrectors extends Omit<Tutorial, 'tutor' | 'correctors'> {
  tutor?: User;
  correctors: User[];
}

export interface StudentWithFetchedTeam extends Omit<Student, 'team'> {
  team?: Team;
}

export interface HasPoints extends HasId {
  points: { [index: string]: number };
}

export interface HasExercises extends HasId {
  exercises: Exercise[];
}

export interface StudentScheinCriteriaSummaryMap {
  [id: string]: ScheinCriteriaSummary;
}

export interface StudentByTutorialSlotSummaryMap {
  [tutorialSlot: string]: ScheinCriteriaSummary[];
}
