import { Student } from 'shared/dist/model/Student';
import scheincriteriaService from '../../../services/scheincriteria-service/ScheincriteriaService.class';
import { StatusCheckResponse } from '../Scheincriteria';
import {
  PossiblePercentageCriteria,
  possiblePercentageCriteriaSchema,
} from './PossiblePercentageCriteria';

export class SheetTotalCriteria extends PossiblePercentageCriteria {
  constructor(percentage: boolean, valueNeeded: number) {
    super('sheetTotal', percentage, valueNeeded);
  }

  isPassed(student: Student): boolean {
    throw new Error('Method not implemented.');
  }

  checkCriteriaStatus(student: Student): StatusCheckResponse {
    throw new Error('Method not implemented.');
  }
}

scheincriteriaService.registerBluePrint(
  new SheetTotalCriteria(false, 0),
  possiblePercentageCriteriaSchema
);
