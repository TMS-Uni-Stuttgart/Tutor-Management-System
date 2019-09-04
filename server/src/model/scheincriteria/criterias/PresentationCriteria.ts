import { Scheincriteria } from '../scheincriterias';
import scheincriteriaService from '../../../services/scheincriteria-service/ScheincriteriaService.class';

export class PresentationCriteria implements Scheincriteria {
  readonly identifier = 'presentation';
  readonly presentationNeeded: number;

  constructor(presentationNeeded: number) {
    this.presentationNeeded = presentationNeeded;
  }

  isPassed() {
    return false;
  }
}

scheincriteriaService.registerBluePrint(new PresentationCriteria(5));
