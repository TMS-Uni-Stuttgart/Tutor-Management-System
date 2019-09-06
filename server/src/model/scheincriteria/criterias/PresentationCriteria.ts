import { ScheinCriteriaUnit } from 'shared/dist/model/ScheinCriteria';
import { Student } from 'shared/dist/model/Student';
import * as Yup from 'yup';
import { CleanCriteriaShape } from '../../../helpers/typings';
import scheincriteriaService from '../../../services/scheincriteria-service/ScheincriteriaService.class';
import { Scheincriteria, StatusCheckResponse } from '../Scheincriteria';
import { ScheincriteriaNumber } from '../ScheincriteriaDecorators';

export class PresentationCriteria extends Scheincriteria {
  @ScheincriteriaNumber({ min: 0 })
  readonly presentationsNeeded: number;

  constructor(presentationsNeeded: number) {
    super('presentation');
    this.presentationsNeeded = presentationsNeeded;
  }

  isPassed(student: Student): boolean {
    // TODO: Not needed -- at least not as abstract function?!
    throw new Error('Method not implemented');
  }

  checkCriteriaStatus(student: Student): StatusCheckResponse {
    const achieved = Object.values(student.presentationPoints).reduce(
      (prev, current) => prev + current,
      0
    );

    return {
      identifier: this.identifier,
      achieved,
      total: this.presentationsNeeded,
      passed: achieved >= this.presentationsNeeded,
      unit: ScheinCriteriaUnit.PRESENTATION,
      infos: {},
    };
  }
}

const presentationCriteriaSchema = Yup.object().shape<CleanCriteriaShape<PresentationCriteria>>({
  presentationsNeeded: Yup.number()
    .min(0)
    .required(),
});

scheincriteriaService.registerBluePrint(new PresentationCriteria(5), presentationCriteriaSchema);
