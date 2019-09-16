import { HasId } from './Common';
import { Student } from './Student';
import { PointMap } from './Sheet';

export interface Team extends HasId {
  points: PointMap;
  students: Student[];
  teamNo: number;
  tutorial: string;
}

export interface TeamDTO {
  students: string[];
}
