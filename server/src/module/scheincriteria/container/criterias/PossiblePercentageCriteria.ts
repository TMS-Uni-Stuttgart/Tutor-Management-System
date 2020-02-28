import { IsBoolean, IsNumber, Min } from 'class-validator';
import { Scheincriteria } from '../Scheincriteria';
import { ScheincriteriaPossiblePercentage } from '../scheincriteria.decorators';

export abstract class PossiblePercentageCriteria extends Scheincriteria {
  @IsBoolean()
  readonly percentage: boolean;

  @ScheincriteriaPossiblePercentage('percentage')
  @IsNumber()
  @Min(0)
  readonly valueNeeded: number;

  constructor(identifier: string, percentage: boolean, valueNeeded: number) {
    super(identifier);

    this.percentage = percentage;
    this.valueNeeded = valueNeeded;
  }
}
