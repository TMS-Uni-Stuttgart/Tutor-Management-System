import { IsBoolean } from 'class-validator';
import { IsNonNegativeNumberValue } from '../../../../helpers/validators/nonNegativeNumberValue.validator';
import { Scheincriteria } from '../Scheincriteria';
import { ScheincriteriaPossiblePercentage } from '../scheincriteria.decorators';

export abstract class PossiblePercentageCriteria extends Scheincriteria {
    @IsBoolean()
    readonly percentage: boolean;

    @IsNonNegativeNumberValue({ isFloat: true })
    @ScheincriteriaPossiblePercentage('percentage')
    readonly valueNeeded: number;

    constructor(identifier: string, percentage: boolean, valueNeeded: number) {
        super(identifier);

        this.percentage = percentage;
        this.valueNeeded = valueNeeded;
    }
}
