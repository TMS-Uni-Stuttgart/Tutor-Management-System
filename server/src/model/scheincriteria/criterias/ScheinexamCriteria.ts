import { ScheinCriteriaStatus } from 'shared/dist/model/ScheinCriteria';
import { Student } from 'shared/dist/model/Student';
import * as Yup from 'yup';
import { CleanCriteriaShape } from '../../../helpers/typings';
import scheincriteriaService from '../../../services/scheincriteria-service/ScheincriteriaService.class';
import { Scheincriteria } from '../Scheincriteria';
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

  isPassed(student: Student): boolean {
    throw new Error('Method not implemented.');
  }

  getStatusDTO(student: Student): ScheinCriteriaStatus {
    throw new Error('Method not implemented.');
  }
}

const scheinexamCriteriaSchema = Yup.object().shape<CleanCriteriaShape<ScheinexamCriteria>>({
  passAllExamsIndividually: Yup.boolean().required(),
  percentageOfAllPointsNeeded: Yup.number()
    .min(0)
    .required(),
});

scheincriteriaService.registerBluePrint(new ScheinexamCriteria(false, 0), scheinexamCriteriaSchema);
