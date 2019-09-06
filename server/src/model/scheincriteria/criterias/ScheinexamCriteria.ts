import { Student } from 'shared/dist/model/Student';
import * as Yup from 'yup';
import { CleanCriteriaShape } from '../../../helpers/typings';
import scheincriteriaService from '../../../services/scheincriteria-service/ScheincriteriaService.class';
import { Scheincriteria, StatusCheckResponse } from '../Scheincriteria';
import { ScheincriteriaPercentage } from '../ScheincriteriaDecorators';
import scheinexamService from '../../../services/scheinexam-service/ScheinexamService.class';
import { ScheinExam } from 'shared/dist/model/Scheinexam';
import { PointId } from 'shared/dist/model/Sheet';
import { PassedState, ScheinCriteriaUnit } from 'shared/dist/model/ScheinCriteria';

export class ScheinexamCriteria extends Scheincriteria {
  readonly passAllExamsIndividually: boolean;

  @ScheincriteriaPercentage()
  readonly percentageOfAllPointsNeeded: number;

  constructor(passAllExamsIndividually: boolean, percentageOfAllPointsNeeded: number) {
    super('exam');

    this.passAllExamsIndividually = passAllExamsIndividually;
    this.percentageOfAllPointsNeeded = percentageOfAllPointsNeeded;
  }

  async checkCriteriaStatus(student: Student): Promise<StatusCheckResponse> {
    const exams = await scheinexamService.getAllScheinExams();
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

  private checkAllExams(
    exams: ScheinExam[],
    student: Student,
    infos: StatusCheckResponse['infos']
  ): { examsPassed: number; pointsAchieved: number; pointsTotal: number } {
    let pointsAchieved = 0;
    let pointsTotal = 0;
    let examsPassed = 0;

    for (const exam of exams) {
      const result = scheinexamService.getScheinExamResult(student, exam);
      const maxPoints = scheinexamService.getScheinExamTotalPoints(exam);
      let state: PassedState = PassedState.NOTPASSED;

      if (result / maxPoints > this.percentageOfAllPointsNeeded) {
        state = PassedState.PASSED;
        examsPassed += 1;
      }

      pointsAchieved += result;
      pointsTotal += maxPoints;

      infos[exam.id] = {
        achieved: result,
        total: maxPoints,
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
