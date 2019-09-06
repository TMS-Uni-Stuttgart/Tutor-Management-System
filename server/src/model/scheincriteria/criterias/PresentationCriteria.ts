import scheincriteriaService from '../../../services/scheincriteria-service/ScheincriteriaService.class';
import { ScheincriteriaNumber } from '../ScheincriteriaDecorators';
import { Scheincriteria } from '../Scheincriteria';

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

scheincriteriaService.registerBluePrint(new PresentationCriteria(5));
