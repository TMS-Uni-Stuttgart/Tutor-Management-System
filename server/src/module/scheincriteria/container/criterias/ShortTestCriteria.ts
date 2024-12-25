import { IsBoolean } from 'class-validator';
import {
    PassedState,
    ScheincriteriaIdentifier,
    ScheinCriteriaUnit,
} from 'shared/model/ScheinCriteria';
import { ShortTest } from '../../../../database/entities/shorttest.entity';
import { Student } from '../../../../database/entities/student.entity';
import { IsNonNegativeNumberValue } from '../../../../helpers/validators/nonNegativeNumberValue.validator';
import {
    CriteriaInformationWithoutName,
    CriteriaPayload,
    InformationPayload,
    StatusCheckResponse,
} from '../Scheincriteria';
import { ScheincriteriaPossiblePercentage } from '../scheincriteria.decorators';
import { PossiblePercentageCriteria } from './PossiblePercentageCriteria';
import { GradingList } from '../../../../helpers/GradingList';

interface CheckShortTestsParams {
    student: Student;
    gradings: GradingList;
    shortTests: ShortTest[];
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

    checkCriteriaStatus({
        student,
        shortTests,
        gradingsOfStudent,
    }: CriteriaPayload): StatusCheckResponse {
        const { passed: testsPassed, infos } = this.checkShortTests({
            student,
            shortTests,
            gradings: gradingsOfStudent,
        });
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
            chartType: 'PieChart',
        };
    }

    getInformation(payload: InformationPayload): CriteriaInformationWithoutName {
        throw new Error('Method not implemented.');
    }

    private checkShortTests({
        student,
        shortTests,
        gradings,
    }: CheckShortTestsParams): CheckShortTestsReturn {
        return shortTests.reduce<CheckShortTestsReturn>(
            (prev, shortTest) => {
                const grading = gradings.getGradingOfHandIn(shortTest);
                const achieved = grading?.points ?? 0;
                const total = shortTest.totalPoints.must;

                const state = shortTest.hasPassed(student, gradings)
                    ? PassedState.PASSED
                    : PassedState.NOT_PASSED;

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
