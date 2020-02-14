import { HasId } from './Common';
import { PointMapDTO } from './Points';
import { Student } from './Student';

export interface Team extends HasId {
  points: PointMapDTO;
  students: Student[];
  teamNo: number;
  tutorial: string;
}

export interface TeamDTO {
  students: string[];
}
