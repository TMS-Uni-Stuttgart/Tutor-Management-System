import { IsBoolean } from 'class-validator';
import { ShortTestDocument } from '../../../../database/models/shortTest.model';
import { StudentDocument } from '../../../../database/models/student.model';
import { IsNonNegativeNumberValue } from '../../../../helpers/validators/nonNegativeNumberValue.validator';
import {
    PassedState,
    ScheincriteriaIdentifier,
    ScheinCriteriaUnit,
} from '../../../../shared/model/ScheinCriteria';
import {
    CriteriaInformationWithoutName,
    CriteriaPayload,
    InformationPayload,
    StatusCheckResponse,
} from '../Scheincriteria';
import { ScheincriteriaPossiblePercentage } from '../scheincriteria.decorators';
import { PossiblePercentageCriteria } from './PossiblePercentageCriteria';

interface CheckShortTestsParams {
    student: StudentDocument;
    shortTests: ShortTestDocument[];
}

interface CheckShortTestsReturn {
    infos: StatusCheckResponse['infos'];
    passed: number;
}

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

    checkCriteriaStatus({ student, shortTests }: CriteriaPayload): StatusCheckResponse {
        const { passed: testsPassed, infos } = this.checkShortTests({ student, shortTests });
        const totalShortTestCount = shortTests.length;
        const passed: boolean = this.percentage
            ? testsPassed / shortTests.length >= this.valueNeeded
            : testsPassed >= this.valueNeeded;

        return {
            identifier: this.identifier,
            achieved: testsPassed,
            total: totalShortTestCount,
            passed,
            infos,
            unit: ScheinCriteriaUnit.SHORT_TEST,
        };
    }

    getInformation(payload: InformationPayload): CriteriaInformationWithoutName {
        throw new Error('Method not implemented.');
    }

    private checkShortTests({ student, shortTests }: CheckShortTestsParams): CheckShortTestsReturn {
        return shortTests.reduce<CheckShortTestsReturn>(
            (prev, shortTest) => {
                const achieved = student.getGrading(shortTest)?.points ?? 0;
                const total = shortTest.totalPoints.must;

                let state = PassedState.NOT_PASSED;
                if (this.isPercentagePerTest) {
                    if (shortTest.hasPassed(student)) {
                        state = PassedState.PASSED;
                    }
                } else {
                    if (achieved >= this.valuePerTestNeeded) {
                        state = PassedState.PASSED;
                    }
                }

                return {
                    passed: state === PassedState.PASSED ? prev.passed + 1 : prev.passed,
                    infos: {
                        ...prev.infos,
                        [shortTest.id]: {
                            achieved,
                            total,
                            no: shortTest.shortTestNo,
                            state,
                            unit: ScheinCriteriaUnit.POINT,
                        },
                    },
                };
            },
            {
                infos: {},
                passed: 0,
            }
        );
    }
}
