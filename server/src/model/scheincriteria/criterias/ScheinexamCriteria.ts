import scheincriteriaService from '../../../services/scheincriteria-service/ScheincriteriaService.class';
import { Scheincriteria } from '../Scheincriteria';
import { StudentDocument } from '../../documents/StudentDocument';
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

scheincriteriaService.registerBluePrint(new ScheinexamCriteria(false, 0));
