import { ScheinCriteriaUnit } from '../../../../shared/model/ScheinCriteria';
import {
  CriteriaInformationWithoutName,
  CriteriaPayload,
  InformationPayload,
  Scheincriteria,
  StatusCheckResponse,
} from '../Scheincriteria';
import { ScheincriteriaNumber } from '../scheincriteria.decorators';

export class PresentationCriteria extends Scheincriteria {
  @ScheincriteriaNumber({ min: 0 })
  readonly presentationsNeeded: number;

  constructor(presentationsNeeded: number = 0) {
    super('presentation');
    this.presentationsNeeded = presentationsNeeded;
  }

  checkCriteriaStatus({ student }: CriteriaPayload): StatusCheckResponse {
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

  getInformation(payload: InformationPayload): CriteriaInformationWithoutName {
    throw new Error('Method not implemented.');
  }
}
