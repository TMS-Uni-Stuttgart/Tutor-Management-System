import { Attendance } from './Attendance';
import { HasId, NamedElement } from './Common';
import { PointMapDTO } from './Points';

interface TeamInStudent extends HasId {
  teamNo: number;
}

export interface Student extends NamedElement {
  attendance: { [index: string]: Attendance };
  courseOfStudies?: string;
  email?: string;
  matriculationNo?: string;
  points: PointMapDTO;
  presentationPoints: { [index: string]: number };
  scheinExamResults: PointMapDTO;
  team?: TeamInStudent;
  tutorial: string;
  cakeCount: number;
}

export interface StudentDTO {
  courseOfStudies?: string;
  email?: string;
  firstname: string;
  lastname: string;
  matriculationNo?: string;
  team?: string;
  tutorial: string;
}

export interface PresentationPointsDTO {
  points: number;
  sheetId: string;
}

export interface CakeCountDTO {
  cakeCount: number;
}
