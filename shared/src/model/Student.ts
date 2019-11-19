import { Attendance } from './Attendance';
import { HasId, NamedElement } from './Common';
import { PointMapDTO } from './Points';

interface TeamInStudent extends HasId {
  teamNo: number;
}

export enum StudentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  NO_SCHEIN_REQUIRED = 'NO_SCHEIN_REQUIRED',
}

export interface Student extends NamedElement {
  attendance: { [index: string]: Attendance };
  courseOfStudies?: string;
  email?: string;
  matriculationNo?: string;
  points: PointMapDTO;
  presentationPoints: { [index: string]: number };
  scheinExamResults: PointMapDTO;
  status: StudentStatus;
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
  status: StudentStatus;
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
