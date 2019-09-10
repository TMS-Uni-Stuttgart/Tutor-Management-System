import { HasId } from 'shared/dist/model/Common';
import { ScheinCriteriaSummary } from 'shared/dist/model/ScheinCriteria';
import { Exercise } from 'shared/dist/model/Sheet';
import { Student } from 'shared/dist/model/Student';
import { Team } from 'shared/dist/model/Team';
import { Tutorial } from 'shared/dist/model/Tutorial';
import { User } from 'shared/dist/model/User';

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
