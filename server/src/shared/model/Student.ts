import { HasId, NamedElement } from './Common';
import { PointMapDTO } from './Points';

export interface TeamInStudent extends HasId {
  teamNo: number;
}

export enum StudentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  NO_SCHEIN_REQUIRED = 'NO_SCHEIN_REQUIRED',
}

export interface TutorialInStudent {
  id: string;
  slot: string;
}

export interface Student extends NamedElement {
  attendances: [string, string][];
  courseOfStudies?: string;
  email?: string;
  matriculationNo?: string;
  points: PointMapDTO;
  presentationPoints: { [index: string]: number };
  status: StudentStatus;
  team?: TeamInStudent;
  tutorial: TutorialInStudent;
  cakeCount: number;
}

export interface IStudentDTO {
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
