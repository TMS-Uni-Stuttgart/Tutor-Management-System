import * as Yup from 'yup';
import { CleanShape } from '../../../helpers/typings';
import { Scheincriteria, scheincriteriaSchema } from '../Scheincriteria';
import { ScheincriteriaPossiblePercentage } from '../ScheincriteriaDecorators';

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

export const possiblePercentageCriteriaSchema = Yup.object()
  .shape<CleanShape<PossiblePercentageCriteria, Scheincriteria>>({
    percentage: Yup.boolean().required(),
    valueNeeded: Yup.number()
      .min(0)
      .required(),
  })
  .concat(scheincriteriaSchema);
