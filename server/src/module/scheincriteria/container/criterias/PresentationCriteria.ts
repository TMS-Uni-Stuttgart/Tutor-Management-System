import { Transform } from 'class-transformer';
import { IsNonNegativeNumberValue } from '../../../../helpers/validators/nonNegativeNumberValue.validator';
import { ScheincriteriaIdentifier, ScheinCriteriaUnit } from 'shared/model/ScheinCriteria';
import {
    CriteriaInformationWithoutName,
    CriteriaPayload,
    InformationPayload,
    Scheincriteria,
    StatusCheckResponse,
} from '../Scheincriteria';
import { ScheincriteriaNumber } from '../scheincriteria.decorators';

export class PresentationCriteria extends Scheincriteria {
    @IsNonNegativeNumberValue()
    @Transform(({ value }) => Number.parseInt(value))
    @ScheincriteriaNumber({ min: 0 })
    readonly presentationsNeeded: number;

    constructor(presentationsNeeded: number) {
        super(ScheincriteriaIdentifier.PRESENTATION);
        this.presentationsNeeded = presentationsNeeded;
    }

    checkCriteriaStatus({ student }: CriteriaPayload): StatusCheckResponse {
        let achieved = 0;

        for (const value of student.presentationPoints.values()) {
            achieved += value;
        }

        return {
            identifier: this.identifier,
            achieved,
            total: this.presentationsNeeded,
            passed: achieved >= this.presentationsNeeded,
            unit: ScheinCriteriaUnit.PRESENTATION,
            infos: {},
            chartType: 'ColumnChart',
        };
    }

    getInformation(payload: InformationPayload): CriteriaInformationWithoutName {
        throw new Error('Method not implemented.');
    }
}
