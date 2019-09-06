import { Student } from 'shared/dist/model/Student';
import scheincriteriaService from '../../../services/scheincriteria-service/ScheincriteriaService.class';
import {
  PossiblePercentageCriteria,
  possiblePercentageCriteriaSchema,
} from './PossiblePercentageCriteria';
import { ScheinCriteriaStatus } from 'shared/dist/model/ScheinCriteria';

export class SheetTotalCriteria extends PossiblePercentageCriteria {
  constructor(percentage: boolean, valueNeeded: number) {
    super('sheetTotal', percentage, valueNeeded);
  }

  isPassed(student: Student): boolean {
    throw new Error('Method not implemented.');
  }

  getStatusDTO(student: Student): ScheinCriteriaStatus {
    throw new Error('Method not implemented.');
  }
}

scheincriteriaService.registerBluePrint(
  new SheetTotalCriteria(false, 0),
  possiblePercentageCriteriaSchema
);
