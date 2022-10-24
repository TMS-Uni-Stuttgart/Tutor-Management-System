import { IAttendance } from './Attendance';
import { HasId, ITutorialInEntity, NamedElement } from './Common';

export interface TeamInStudent extends HasId {
    teamNo: number;
}

export enum StudentStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    NO_SCHEIN_REQUIRED = 'NO_SCHEIN_REQUIRED',
}

export interface IStudent extends NamedElement {
    iliasName?: string;
    attendances: [string, IAttendance][];
    courseOfStudies?: string;
    email?: string;
    matriculationNo?: string;
    presentationPoints: [string, number][];
    status: StudentStatus;
    team?: TeamInStudent;
    tutorial: ITutorialInEntity;
    cakeCount: number;
}

export interface IStudentDTO {
    firstname: string;
    lastname: string;
    iliasName?: string;
    courseOfStudies?: string;
    email?: string;
    matriculationNo?: string;
    status: StudentStatus;
    team?: string;
}

export interface ICreateStudentDTO extends IStudentDTO {
    tutorial: string;
}

export interface ICreateStudentsDTO {
    tutorial: string;
    students: IStudentDTO[];
}

export interface ICakeCountDTO {
    cakeCount: number;
}
