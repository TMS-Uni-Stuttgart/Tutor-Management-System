import { StudentDocument } from '../../documents/StudentDocument';
import { ScheincriteriaPossiblePercentage } from '../scheincriteriaDecorators';
import { PossiblePercentageCriteria } from './PossiblePercentageCriteria';
import scheincriteriaService from '../../../services/scheincriteria-service/ScheincriteriaService.class';

export class SheetIndividualCriteria extends PossiblePercentageCriteria {
  @ScheincriteriaPossiblePercentage('percentagePerSheet')
  readonly valuePerSheetNeeded: number;
  readonly percentagePerSheet: boolean;

  constructor(
    percentage: boolean,
    valueNeeded: number,
    percentagePerSheet: boolean,
    valuePerSheetNeeded: number
  ) {
    super('sheetIndividual', percentage, valueNeeded);

    this.valuePerSheetNeeded = valuePerSheetNeeded;
    this.percentagePerSheet = percentagePerSheet;
  }

  isPassed(student: StudentDocument): boolean {
    throw new Error('Method not implemented.');
  }
}

scheincriteriaService.registerBluePrint(new SheetIndividualCriteria(false, 0, false, 0));
