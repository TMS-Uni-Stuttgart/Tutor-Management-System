import { NamedElement } from './Common';
import { Attendance } from './Attendance';
import { PointMapDTO } from './Points';

export interface Student extends NamedElement {
  attendance: { [index: string]: Attendance };
  courseOfStudies?: string;
  email?: string;
  matriculationNo?: string;
  points: PointMapDTO;
  presentationPoints: { [index: string]: number };
  scheinExamResults: PointMapDTO;
  team?: string;
  tutorial: string;
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
