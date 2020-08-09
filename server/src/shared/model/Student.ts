import { IAttendance } from './Attendance';
import { HasId, NamedElement, TutorialInEntity } from './Common';
import { IGrading } from './Gradings';

export interface TeamInStudent extends HasId {
  teamNo: number;
}

export enum StudentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  NO_SCHEIN_REQUIRED = 'NO_SCHEIN_REQUIRED',
}

export interface IStudent extends NamedElement {
  iliasName: string;
  attendances: [string, IAttendance][];
  courseOfStudies?: string;
  email?: string;
  matriculationNo?: string;
  gradings: [string, IGrading][];
  presentationPoints: [string, number][];
  status: StudentStatus;
  team?: TeamInStudent;
  tutorial: TutorialInEntity;
  cakeCount: number;
}

export interface IStudentDTO {
  firstname: string;
  lastname: string;
  iliasName: string;
  courseOfStudies?: string;
  email?: string;
  matriculationNo?: string;
  status: StudentStatus;
  team?: string;
  tutorial: string;
}

export interface ICakeCountDTO {
  cakeCount: number;
}
