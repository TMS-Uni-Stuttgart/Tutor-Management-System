import { Scheincriteria } from '../../../services/scheincriteria-service/ScheincriteriaService.class';
import { ScheincriteriaPossiblePercentage } from '../scheincriteriaDecorators';

export abstract class PossiblePercentageCriteria extends Scheincriteria {
  readonly percentage: boolean;

  @ScheincriteriaPossiblePercentage('percentage')
  readonly valueNeeded: number;

  constructor(identifier: string, percentage: boolean, valueNeeded: number) {
    super(identifier);

    this.percentage = percentage;
    this.valueNeeded = valueNeeded;
  }
}
