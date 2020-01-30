import {
  CriteriaDistributionInformation,
  CriteriaSheetOrExamInformation,
  PassedState,
  ScheinCriteriaUnit,
} from 'shared/dist/model/ScheinCriteria';
import { getPointsOfExercise, PointId, PointMap } from 'shared/dist/model/Points';
import * as Yup from 'yup';
import { CleanCriteriaShape } from '../../../helpers/typings';
import scheincriteriaService from '../../../services/scheincriteria-service/ScheincriteriaService.class';
import scheinexamService from '../../../services/scheinexam-service/ScheinexamService.class';
import { convertDocumentToExercise } from '../../documents/ExerciseDocument';
import { ScheinexamDocument } from '../../documents/ScheinexamDocument';
import { StudentDocument } from '../../documents/StudentDocument';
import {
  CriteriaInformationWithoutName,
  Scheincriteria,
  StatusCheckResponse,
} from '../Scheincriteria';
import { ScheincriteriaPercentage } from '../ScheincriteriaDecorators';

export class ScheinexamCriteria extends Scheincriteria {
  readonly passAllExamsIndividually: boolean;

  @ScheincriteriaPercentage()
  readonly percentageOfAllPointsNeeded: number;

  constructor(passAllExamsIndividually: boolean, percentageOfAllPointsNeeded: number) {
    super('exam');

    this.passAllExamsIndividually = passAllExamsIndividually;
    this.percentageOfAllPointsNeeded = percentageOfAllPointsNeeded;
  }

  async checkCriteriaStatus(student: StudentDocument): Promise<StatusCheckResponse> {
    const exams = await scheinexamService.getAllScheinExamAsDocuments();
    const infos: StatusCheckResponse['infos'] = {};
    const { examsPassed, pointsAchieved, pointsTotal } = this.checkAllExams(exams, student, infos);

    let passed: boolean = false;

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
    };
  }

  async getInformation(students: StudentDocument[]): Promise<CriteriaInformationWithoutName> {
    const exams = await scheinexamService.getAllScheinExamAsDocuments();
    const information: CriteriaInformationWithoutName['information'] = {};

    exams.forEach(exam => {
      const averages: { [exName: string]: number[] } = {};
      const distribution: CriteriaDistributionInformation = {};
      const achieved = { achieved: 0, notAchieved: 0, notPresent: 0 };

      exam.exercises.forEach(exercise => {
        averages[exercise.exName] = [];
      });

      students.forEach(student => {
        const points = new PointMap(student.scheinExamResults);
        const hasAttended = points.has(exam.id);

        if (!hasAttended) {
          achieved.notPresent += 1;
          return;
        }

        const result = exam.hasPassed(student);
        const distributionForThisResult = distribution[result.achieved] ?? {
          value: 0,
          aboveThreshhold: result.achieved / result.total.must >= exam.percentageNeeded,
        };

        exam.exercises.forEach(exercise => {
          averages[exercise.exName].push(points.getPoints(new PointId(exam.id, exercise)) ?? 0);
        });

        distribution[result.achieved] = {
          aboveThreshhold: distributionForThisResult.aboveThreshhold,
          value: distributionForThisResult.value + 1,
        };

        if (result.passed) {
          achieved.achieved += 1;
        } else {
          achieved.notAchieved += 1;
        }
      });

      information[exam.id] = {
        achieved,
        total: achieved.achieved + achieved.notAchieved + achieved.notPresent,
        averages: exam.exercises.reduce((avgInfo, exercise) => {
          const total: number = getPointsOfExercise(exercise).must;
          const achievedPoints = averages[exercise.exName];
          const value: number =
            achievedPoints.length > 0
              ? achievedPoints.reduce((sum, current) => sum + current, 0) / achievedPoints.length
              : 0;

          return { ...avgInfo, [exercise.exName]: { value, total } };
        }, {}),
        distribution,
      };
    });

    return {
      identifier: this.identifier,
      sheetsOrExams: exams.map<CriteriaSheetOrExamInformation>(exam => ({
        id: exam.id,
        no: exam.scheinExamNo,
        exercises: exam.exercises.map(convertDocumentToExercise),
      })),
      information,
    };
  }

  private checkAllExams(
    exams: ScheinexamDocument[],
    student: StudentDocument,
    infos: StatusCheckResponse['infos']
  ): { examsPassed: number; pointsAchieved: number; pointsTotal: number } {
    // FIXME: DOES NOT WORK!!!
    let pointsAchieved = 0;
    let pointsTotal = 0;
    let examsPassed = 0;

    for (const exam of exams) {
      const { passed, achieved, total } = exam.hasPassed(student);
      const state: PassedState = passed ? PassedState.PASSED : PassedState.NOTPASSED;

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

const scheinexamCriteriaSchema = Yup.object().shape<CleanCriteriaShape<ScheinexamCriteria>>({
  passAllExamsIndividually: Yup.boolean().required(),
  percentageOfAllPointsNeeded: Yup.number()
    .min(0)
    .required(),
});

scheincriteriaService.registerBluePrint(new ScheinexamCriteria(false, 0), scheinexamCriteriaSchema);
