import { HasExercises } from './Sheet';

export interface ScheinCriteriaResponse {
  id: string;
  identifier: string;
  name: string;
  data: {
    [key: string]: any;
  };
}

export interface IScheinCriteriaDTO {
  data: any;
  name: string;
  identifier: string;
}

export type ScheincriteriaSummaryByStudents = { [studentId: string]: ScheinCriteriaSummary };

export type SingleScheincriteriaSummaryByStudents = { [studentId: string]: ScheinCriteriaStatus };

export interface ScheinCriteriaSummary {
  passed: boolean;
  scheinCriteriaSummary: { [criteriaId: string]: ScheinCriteriaStatus };
}

// TODO: Rename commentated properties to self-explanatory. This comes with changes in the frontend! -- Question: Are those actually (except 'id') really needed?
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
  NOTPASSED = 'NOTPASSED',
  IGNORE = 'IGNORE',
}

export enum ScheinCriteriaUnit {
  SHEET = 'SHEET',
  POINT = 'POINT',
  EXAM = 'EXAM',
  PRESENTATION = 'PRESENTATION',
  DATE = 'DATE',
}

export interface CriteriaAchievedInformation {
  achieved: number;
  notAchieved: number;
  [other: string]: number;
}

export interface CriteriaDistributionInformation {
  [key: string]: {
    value: number;
    aboveThreshhold: boolean;
  };
}

export interface CriteriaAveragesInformation {
  [identifier: string]: {
    value: number;
    total: number;
  };
}

export interface CriteriaSheetOrExamInformation extends HasExercises {
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
