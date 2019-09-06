import * as Yup from 'yup';
import { CleanShape } from '../../../helpers/typings';
import scheincriteriaService from '../../../services/scheincriteria-service/ScheincriteriaService.class';
import { StudentDocument } from '../../documents/StudentDocument';
import { Scheincriteria, scheincriteriaSchema } from '../Scheincriteria';
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

  isPassed(student: StudentDocument): boolean {
    throw new Error('Method not implemented.');
  }
}

const scheinexamCriteriaSchema = Yup.object()
  .shape<CleanShape<ScheinexamCriteria, Scheincriteria>>({
    passAllExamsIndividually: Yup.boolean().required(),
    percentageOfAllPointsNeeded: Yup.number()
      .min(0)
      .required(),
  })
  .concat(scheincriteriaSchema);

scheincriteriaService.registerBluePrint(new ScheinexamCriteria(false, 0), scheinexamCriteriaSchema);
