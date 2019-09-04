import scheincriteriaService, {
  Scheincriteria,
} from '../../../services/scheincriteria-service/ScheincriteriaService.class';
import { ScheincriteriaNumber } from '../scheincriteriaDecorators';

export class PresentationCriteria extends Scheincriteria {
  @ScheincriteriaNumber({ min: 0 })
  readonly presentationNeeded: number;

  constructor(presentationNeeded: number) {
    super('presentation');
    this.presentationNeeded = presentationNeeded;
  }

  isPassed() {
    return false;
  }
}

scheincriteriaService.registerBluePrint(new PresentationCriteria(5));
