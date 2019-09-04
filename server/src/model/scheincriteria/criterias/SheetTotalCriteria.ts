import { PossiblePercentageCriteria } from './PossiblePercentageCriteria';
import { StudentDocument } from '../../documents/StudentDocument';
import scheincriteriaService from '../../../services/scheincriteria-service/ScheincriteriaService.class';

export class SheetTotalCriteria extends PossiblePercentageCriteria {
  constructor(percentage: boolean, valueNeeded: number) {
    super('sheetTotal', percentage, valueNeeded);
  }

  isPassed(student: StudentDocument): boolean {
    throw new Error('Method not implemented.');
  }
}

scheincriteriaService.registerBluePrint(new SheetTotalCriteria(false, 0));
