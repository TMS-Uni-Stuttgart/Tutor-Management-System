import * as Yup from 'yup';
import { CleanShape } from '../../../helpers/typings';
import scheincriteriaService from '../../../services/scheincriteria-service/ScheincriteriaService.class';
import { Scheincriteria, scheincriteriaSchema } from '../Scheincriteria';
import { ScheincriteriaNumber } from '../ScheincriteriaDecorators';

export class PresentationCriteria extends Scheincriteria {
  @ScheincriteriaNumber({ min: 0 })
  readonly presentationsNeeded: number;

  constructor(presentationsNeeded: number) {
    super('presentation');
    this.presentationsNeeded = presentationsNeeded;
  }

  isPassed() {
    return false;
  }
}

const presentationCriteriaSchema = Yup.object()
  .shape<CleanShape<PresentationCriteria, Scheincriteria>>({
    presentationsNeeded: Yup.number()
      .min(0)
      .required(),
  })
  .concat(scheincriteriaSchema);

scheincriteriaService.registerBluePrint(new PresentationCriteria(5), presentationCriteriaSchema);
