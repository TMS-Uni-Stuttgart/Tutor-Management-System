import { ScheinCriteriaStatus } from 'shared/dist/model/ScheinCriteria';
import { Student } from 'shared/dist/model/Student';
import * as Yup from 'yup';
import { CleanCriteriaShape } from '../../../helpers/typings';
import scheincriteriaService from '../../../services/scheincriteria-service/ScheincriteriaService.class';
import { Scheincriteria } from '../Scheincriteria';
import { ScheincriteriaNumber } from '../ScheincriteriaDecorators';

export class PresentationCriteria extends Scheincriteria {
  @ScheincriteriaNumber({ min: 0 })
  readonly presentationsNeeded: number;

  constructor(presentationsNeeded: number) {
    super('presentation');
    this.presentationsNeeded = presentationsNeeded;
  }

  isPassed(student: Student): boolean {
    throw new Error('Method not implemented');
  }

  getStatusDTO(student: Student): ScheinCriteriaStatus {
    throw new Error('Method not implemented.');
  }
}

const presentationCriteriaSchema = Yup.object().shape<CleanCriteriaShape<PresentationCriteria>>({
  presentationsNeeded: Yup.number()
    .min(0)
    .required(),
});

scheincriteriaService.registerBluePrint(new PresentationCriteria(5), presentationCriteriaSchema);
