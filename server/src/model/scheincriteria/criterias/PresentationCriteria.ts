import { ScheinCriteriaUnit } from 'shared/dist/model/ScheinCriteria';
import * as Yup from 'yup';
import { CleanCriteriaShape } from '../../../helpers/typings';
import scheincriteriaService from '../../../services/scheincriteria-service/ScheincriteriaService.class';
import { StudentDocument } from '../../documents/StudentDocument';
import {
  CriteriaInformationWithoutName,
  Scheincriteria,
  StatusCheckResponse,
} from '../Scheincriteria';
import { ScheincriteriaNumber } from '../ScheincriteriaDecorators';

export class PresentationCriteria extends Scheincriteria {
  @ScheincriteriaNumber({ min: 0 })
  readonly presentationsNeeded: number;

  constructor(presentationsNeeded: number) {
    super('presentation');
    this.presentationsNeeded = presentationsNeeded;
  }

  async checkCriteriaStatus(student: StudentDocument): Promise<StatusCheckResponse> {
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

  async getInformation(students: StudentDocument[]): Promise<CriteriaInformationWithoutName> {
    throw new Error('Method not implemented.');
  }
}

const presentationCriteriaSchema = Yup.object().shape<CleanCriteriaShape<PresentationCriteria>>({
  presentationsNeeded: Yup.number()
    .min(0)
    .required(),
});

scheincriteriaService.registerBluePrint(new PresentationCriteria(5), presentationCriteriaSchema);
