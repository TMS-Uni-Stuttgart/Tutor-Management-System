export interface ScheinCriteriaResponse {
  id: string;
  identifier: string;
  name: string;
  [key: string]: any;
}

export interface ScheinCriteriaDTO {
  data: any;
  name: string;
  identifier: string;
}

export type ScheincriteriaSummaryByStudents = { [studentId: string]: ScheinCriteriaSummary };

export interface ScheinCriteriaSummary {
  passed: boolean;
  scheinCriteriaSummary: { [criteriaId: string]: ScheinCriteriaResponse };
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
