import { ScheinexamDocument } from '../../../database/models/scheinexam.model';
import { SheetDocument } from '../../../database/models/sheet.model';
import { StudentDocument } from '../../../database/models/student.model';
import { CriteriaInformation, ScheinCriteriaStatus } from '../../../shared/model/ScheinCriteria';

export interface CriteriaPayload {
  student: StudentDocument;
  sheets: SheetDocument[];
  exams: ScheinexamDocument[];
}

export interface InformationPayload {
  students: StudentDocument[];
  sheets: SheetDocument[];
  exams: ScheinexamDocument[];
}

export type StatusCheckResponse = Omit<ScheinCriteriaStatus, 'id' | 'name'>;
export type CriteriaInformationWithoutName = Omit<CriteriaInformation, 'name' | 'studentSummaries'>;

export abstract class Scheincriteria {
  constructor(readonly identifier: string) {}

  abstract checkCriteriaStatus(payload: CriteriaPayload): StatusCheckResponse;

  abstract getInformation(payload: InformationPayload): CriteriaInformationWithoutName;
}
