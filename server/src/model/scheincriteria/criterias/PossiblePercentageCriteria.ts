import * as Yup from 'yup';
import { CleanCriteriaShape } from '../../../helpers/typings';
import { Scheincriteria } from '../Scheincriteria';
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

export const possiblePercentageCriteriaSchema = Yup.object().shape<
  CleanCriteriaShape<PossiblePercentageCriteria>
>({
  percentage: Yup.boolean().required(),
  valueNeeded: Yup.number()
    .min(0)
    .required(),
});
