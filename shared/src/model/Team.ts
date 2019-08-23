import { HasId } from './Common';
import { Student } from './Student';

export interface Team extends HasId {
  points: { [index: string]: number };
  students: Student[];
  teamNo: number;
  tutorial: string;
}
