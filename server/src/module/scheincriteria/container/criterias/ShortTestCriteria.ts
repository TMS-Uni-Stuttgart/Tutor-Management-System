import { IsBoolean } from 'class-validator';
import { IsNonNegativeNumberValue } from '../../../../helpers/validators/nonNegativeNumberValue.validator';
import { ScheincriteriaIdentifier } from '../../../../shared/model/ScheinCriteria';
import {
  CriteriaInformationWithoutName,
  CriteriaPayload,
  InformationPayload,
  StatusCheckResponse,
} from '../Scheincriteria';
import { ScheincriteriaPossiblePercentage } from '../scheincriteria.decorators';
import { PossiblePercentageCriteria } from './PossiblePercentageCriteria';

export class ShortTestCriteria extends PossiblePercentageCriteria {
  @IsNonNegativeNumberValue({ isFloat: true })
  @ScheincriteriaPossiblePercentage('isPercentagePerTest')
  readonly valuePerTestNeeded: number;

  @IsBoolean()
  readonly isPercentagePerTest: boolean;

  constructor(
    percentage: boolean,
    valueNeeded: number,
    isPercentagePerTest: boolean,
    valuePerTestNeeded: number
  ) {
    super(ScheincriteriaIdentifier.SHORT_TESTS, percentage, valueNeeded);

    this.valuePerTestNeeded = valuePerTestNeeded;
    this.isPercentagePerTest = isPercentagePerTest;
  }

  checkCriteriaStatus(payload: CriteriaPayload): StatusCheckResponse {
    throw new Error('Method not implemented.');
  }

  getInformation(payload: InformationPayload): CriteriaInformationWithoutName {
    throw new Error('Method not implemented.');
  }
}
