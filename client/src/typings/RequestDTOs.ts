/* tslint:disable */
/* eslint-disable */

import * as types from './ServerResponses';

export interface AttendanceDTO {
    date: DateAsString;
    note?: string | null;
    state?: types.AttendanceState | null;
}

export interface CreateUserDTO extends EditUserDTO {
    password: string;
    username: string;
}

export interface EditUserDTO {
    firstname: string;
    lastname: string;
    roles: types.Role[];
    tutorials: string[];
}

export interface ExceptionDTO {
    message: string;
    status: number;
}

export interface ExerciseDTO {
    bonus: boolean;
    exNo: number;
    maxPoints: number;
}

export interface NewPasswordDTO {
    password: string;
}

export interface PresentationPointsDTO {
    points: number;
    sheetId: string;
}

export interface ScheinCriteriaDTO {
    data: any;
    identifier: string;
}

export interface ScheinExamDTO {
    date: DateAsString;
    exercises: ExerciseDTO[];
    percentageNeeded: number;
    scheinExamNo: number;
}

export interface SheetDTO {
    bonusSheet: boolean;
    exercises: ExerciseDTO[];
    sheetNo: number;
}

export interface StudentDTO {
    courseOfStudies: string;
    email: string;
    firstname: string;
    lastname: string;
    matriculationNo: string;
    team?: string | null;
    tutorial: string;
}

export interface SubstituteDTO {
    dates: DateAsString[];
    tutorId: string;
}

export interface TeamDTO {
    students: string[];
    teamNo: number;
}

export interface TutorialDTO {
    correctorIds: string[];
    dates: DateAsString[];
    endTime: DateAsString;
    slot: number;
    startTime: DateAsString;
    tutorId?: string | null;
}

export interface UpdatePointsDTO {
    exercises: { [index: string]: number };
    id: string;
}

export type DateAsString = string;
