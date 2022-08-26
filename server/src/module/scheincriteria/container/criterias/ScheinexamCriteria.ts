import { IsBoolean } from 'class-validator';
import { PassedState, ScheincriteriaIdentifier, ScheinCriteriaUnit } from 'shared/model/ScheinCriteria';
import { Scheinexam } from '../../../../database/entities/scheinexam.entity';
import { IsNonNegativeNumberValue } from '../../../../helpers/validators/nonNegativeNumberValue.validator';
import {
    CriteriaInformationWithoutName,
    CriteriaPayload,
    InformationPayload,
    Scheincriteria,
    StatusCheckResponse,
} from '../Scheincriteria';
import { ScheincriteriaPercentage } from '../scheincriteria.decorators';
import { GradingList } from '../../../../helpers/GradingList';

export class ScheinexamCriteria extends Scheincriteria {
    @IsBoolean()
    readonly passAllExamsIndividually: boolean;

    @IsNonNegativeNumberValue({ isFloat: true, max: 1 })
    @ScheincriteriaPercentage()
    readonly percentageOfAllPointsNeeded: number;

    constructor(passAllExamsIndividually: boolean, percentageOfAllPointsNeeded: number) {
        super(ScheincriteriaIdentifier.SCHEINEXAM);

        this.passAllExamsIndividually = passAllExamsIndividually;
        this.percentageOfAllPointsNeeded = percentageOfAllPointsNeeded;
    }

    checkCriteriaStatus({ exams, gradings }: CriteriaPayload): StatusCheckResponse {
        const infos: StatusCheckResponse['infos'] = {};
        const { examsPassed, pointsAchieved, pointsTotal } = this.checkAllExams(
            exams,
            gradings,
            infos
        );

        let passed: boolean;

        if (this.passAllExamsIndividually) {
            passed = examsPassed >= exams.length;
        } else {
            passed = pointsAchieved / pointsTotal >= this.percentageOfAllPointsNeeded;
        }

        return {
            identifier: this.identifier,
            achieved: examsPassed,
            total: exams.length,
            unit: ScheinCriteriaUnit.EXAM,
            passed,
            infos,
            chartType: 'PieChart',
        };
    }

    getInformation({ students, exams }: InformationPayload): CriteriaInformationWithoutName {
        throw new Error('Method not implemented.');
    }

    private checkAllExams(
        exams: Scheinexam[],
        gradings: GradingList,
        infos: StatusCheckResponse['infos']
    ): { examsPassed: number; pointsAchieved: number; pointsTotal: number } {
        let pointsAchieved = 0;
        let pointsTotal = 0;
        let examsPassed = 0;

        for (const exam of exams) {
            const { passed, achieved, total } = exam.getPassedInformation(gradings);
            const state: PassedState = passed ? PassedState.PASSED : PassedState.NOT_PASSED;

            if (passed) {
                examsPassed += 1;
            }

            pointsAchieved += achieved;
            pointsTotal += total.must;

            infos[exam.id] = {
                achieved: achieved,
                total: total.must,
                no: exam.scheinExamNo,
                unit: ScheinCriteriaUnit.POINT,
                state,
            };
        }

        return { examsPassed, pointsAchieved, pointsTotal };
    }
}
