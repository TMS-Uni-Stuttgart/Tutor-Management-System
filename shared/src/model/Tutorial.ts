import { HasId } from './Common';

export interface LoggedInUserTutorial extends HasId {
  slot: number;
}

export interface LoggedInUserSubstituteTutorial extends LoggedInUserTutorial {
  dates: Date[];
}
