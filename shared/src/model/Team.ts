import { HasId } from './Common';
import { Student } from './Student';
import { PointMap, PointMapDTO } from './Points';

export interface Team extends HasId {
  points: PointMapDTO;
  students: Student[];
  teamNo: number;
  tutorial: string;
}

export interface TeamDTO {
  students: string[];
}
