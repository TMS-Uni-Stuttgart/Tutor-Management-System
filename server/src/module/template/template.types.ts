import { DateTime } from 'luxon';

export enum PassedState {
    PASSED = 'passed',
    NOT_PASSED = 'notPassed',
    NOT_ATTENDED = 'notAttended',
}

export interface Scheinstatus {
    matriculationNo: string;
    state: Omit<PassedState, 'NOT_ATTENDED'>;
}

export interface ScheinexamStatus {
    matriculationNo: string;
    state: PassedState;
}

export interface AttendanceAttributes {
    tutorialSlot: string;
    tutorName: string;
    date: DateTime;
    students: { name: string }[];
}

export interface CredentialsAttributes {
    users: { name: string; username: string; password?: string }[];
}

export interface MailAttribtutes {
    name: string;
    username: string;
    password: string;
}

export interface ScheinexamAttributes {
    scheinExamNo: number;
    statuses: ScheinexamStatus[];
}

export interface ScheinstatusAttributes {
    statuses: Scheinstatus[];
}

export type Template<T> = (params: T) => string;
