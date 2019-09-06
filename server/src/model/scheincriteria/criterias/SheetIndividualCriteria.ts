import { Student } from 'shared/dist/model/Student';
import * as Yup from 'yup';
import { CleanCriteriaShape } from '../../../helpers/typings';
import scheincriteriaService from '../../../services/scheincriteria-service/ScheincriteriaService.class';
import { StatusCheckResponse } from '../Scheincriteria';
import { ScheincriteriaPossiblePercentage } from '../ScheincriteriaDecorators';
import {
  PossiblePercentageCriteria,
  possiblePercentageCriteriaSchema,
} from './PossiblePercentageCriteria';

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

  isPassed(student: Student): boolean {
    throw new Error('Method not implemented.');
  }

  async checkCriteriaStatus(student: Student): Promise<StatusCheckResponse> {
    throw new Error('Method not implemented.');
  }
}

const sheetIndividualCriteriaSchema = Yup.object()
  .shape<CleanCriteriaShape<SheetIndividualCriteria, PossiblePercentageCriteria>>({
    percentagePerSheet: Yup.boolean().required(),
    valuePerSheetNeeded: Yup.number()
      .min(0)
      .required(),
  })
  .concat(possiblePercentageCriteriaSchema);

scheincriteriaService.registerBluePrint(
  new SheetIndividualCriteria(false, 0, false, 0),
  sheetIndividualCriteriaSchema
);
