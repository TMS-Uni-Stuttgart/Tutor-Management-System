import { NamedElement } from './Common';
import { Attendance } from './Attendance';

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
