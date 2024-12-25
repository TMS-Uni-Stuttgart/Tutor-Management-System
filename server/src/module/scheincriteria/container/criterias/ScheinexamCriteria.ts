import { IsBoolean } from 'class-validator';
import {
    PassedState,
    ScheincriteriaIdentifier,
    ScheinCriteriaUnit,
} from 'shared/model/ScheinCriteria';
import { Scheinexam } from '../../../../database/entities/scheinexam.entity';
import { Student } from '../../../../database/entities/student.entity';
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

    checkCriteriaStatus({
        student,
        exams,
        gradingsOfStudent,
    }: CriteriaPayload): StatusCheckResponse {
        const infos: StatusCheckResponse['infos'] = {};
        const { examsPassed, pointsAchieved, pointsTotal } = this.checkAllExams(
            exams,
            student,
            gradingsOfStudent,
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
        // TODO: Clean me up or rewrite me to prevent duplicate code!
        // const information: CriteriaInformationWithoutName['information'] = {};
        //
        // exams.forEach((exam) => {
        //     const averages: { [exName: string]: number[] } = {};
        //     const distribution: CriteriaDistributionInformation = {};
        //     const achieved = { achieved: 0, notAchieved: 0, notPresent: 0 };
        //
        //     exam.exercises.forEach((exercise) => {
        //         averages[exercise.exerciseName] = [];
        //     });
        //
        //     students.forEach((student) => {
        //         const grading = student.getGrading(exam);
        //
        //         if (grading === undefined) {
        //             achieved.notPresent += 1;
        //             return;
        //         }
        //
        //         const result = exam.getPassedInformation(student);
        //         const distributionForThisResult = distribution[result.achieved] ?? {
        //             value: 0,
        //             aboveThreshold: result.achieved / result.total.must >= exam.percentageNeeded,
        //         };
        //
        //         exam.exercises.forEach((exercise) => {
        //             averages[exercise.exerciseName].push(
        //                 grading.getExerciseGrading(exercise)?.points ?? 0
        //             );
        //         });
        //
        //         distribution[result.achieved] = {
        //             aboveThreshold: distributionForThisResult.aboveThreshold,
        //             value: distributionForThisResult.value + 1,
        //         };
        //
        //         if (result.passed) {
        //             achieved.achieved += 1;
        //         } else {
        //             achieved.notAchieved += 1;
        //         }
        //     });
        //
        //     information[exam.id] = {
        //         achieved,
        //         total: achieved.achieved + achieved.notAchieved + achieved.notPresent,
        //         averages: exam.exercises.reduce((avgInfo, exercise) => {
        //             const total: number = exercise.maxPoints;
        //             const achievedPoints = averages[exercise.exerciseName];
        //             const value: number =
        //                 achievedPoints.length > 0
        //                     ? achievedPoints.reduce((sum, current) => sum + current, 0) /
        //                       achievedPoints.length
        //                     : 0;
        //
        //             return {
        //                 ...avgInfo,
        //                 [exercise.exerciseName]: { value, total },
        //             };
        //         }, {}),
        //         distribution,
        //     };
        // });
        //
        // return {
        //     identifier: this.identifier,
        //     sheetsOrExams: exams.map<CriteriaSheetOrExamInformation>((exam) => ({
        //         id: exam.id,
        //         no: exam.scheinExamNo,
        //         exercises: exam.exercises.map((ex) => ex.toDTO()),
        //     })),
        //     information,
        // };
    }

    private checkAllExams(
        exams: Scheinexam[],
        student: Student,
        gradings: GradingList,
        infos: StatusCheckResponse['infos']
    ): { examsPassed: number; pointsAchieved: number; pointsTotal: number } {
        let pointsAchieved = 0;
        let pointsTotal = 0;
        let examsPassed = 0;

        for (const exam of exams) {
            const { passed, achieved, total } = exam.getPassedInformation(student, gradings);
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
