import { IHasExercises } from './HasExercises';
import { IStudent } from './Student';

export enum ScheincriteriaIdentifier {
    ATTENDANCE = 'attendance',
    PRESENTATION = 'presentation',
    SCHEINEXAM = 'scheinexam',
    SHEET_INDIVIDUAL = 'sheetIndividual',
    SHEET_TOTAL = 'sheetTotal',
    SHORT_TESTS = 'shortTests',
}

export interface IScheinCriteria {
    id: string;
    identifier: string;
    name: string;
    data: {
        [key: string]: unknown;
    };
}

export interface IScheinCriteriaDTO {
    data: { [key: string]: unknown };
    name: string;
    identifier: string;
}

export type ScheincriteriaSummaryByStudents = {
    [studentId: string]: ScheinCriteriaSummary;
};

export type SingleScheincriteriaSummaryByStudents = {
    [studentId: string]: ScheinCriteriaStatus;
};

export interface ScheinCriteriaSummary {
    student: IStudent;
    passed: boolean;
    scheinCriteriaSummary: { [criteriaId: string]: ScheinCriteriaStatus };
}

export interface ScheinCriteriaStatus {
    // This is actually the ID of the criteria to which the response belongs to.
    id: string;

    // This is the identifier of the criteria which the response belongs to.
    identifier: string;

    // This is the name of the criteria which the response belongs to.
    name: string;
    passed: boolean;

    achieved: number;
    total: number;
    unit: ScheinCriteriaUnit;
    infos: { [index: string]: ScheinCriteriaAdditionalStatus };
}

export interface ScheinCriteriaAdditionalStatus {
    no: number;
    achieved: number;
    total: number;
    unit: ScheinCriteriaUnit;
    state: PassedState;
}

export enum PassedState {
    PASSED = 'PASSED',
    NOT_PASSED = 'NOT_PASSED',
    IGNORE = 'IGNORE',
}

export enum ScheinCriteriaUnit {
    SHEET = 'SHEET',
    POINT = 'POINT',
    EXAM = 'EXAM',
    PRESENTATION = 'PRESENTATION',
    DATE = 'DATE',
    SHORT_TEST = 'SHORT_TEST',
}

export interface CriteriaAchievedInformation {
    achieved: number;
    notAchieved: number;

    [other: string]: number;
}

export interface CriteriaDistributionInformation {
    [key: string]: {
        value: number;
        aboveThreshold: boolean;
    };
}

export interface CriteriaAveragesInformation {
    [identifier: string]: {
        value: number;
        total: number;
    };
}

export interface CriteriaSheetOrExamInformation extends IHasExercises {
    no: number;
}

export interface CriteriaInformationItem {
    achieved: CriteriaAchievedInformation;
    total: number;
    distribution?: CriteriaDistributionInformation;
    averages?: CriteriaAveragesInformation;
}

export interface CriteriaInformation {
    identifier: string;
    name: string;
    studentSummaries: SingleScheincriteriaSummaryByStudents;
    sheetsOrExams?: CriteriaSheetOrExamInformation[];
    information: { [id: string]: CriteriaInformationItem };
}
