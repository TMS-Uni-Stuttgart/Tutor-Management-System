import { StudentDocument } from '../../documents/StudentDocument';
import { PossiblePercentageCriteria } from './PossiblePercentageCriteria';
import scheincriteriaService from '../../../services/scheincriteria-service/ScheincriteriaService.class';

export class AttendanceCriteria extends PossiblePercentageCriteria {
  constructor(percentage: boolean, valueNeeded: number) {
    super('attendance', percentage, valueNeeded);
  }

  isPassed(student: StudentDocument): boolean {
    throw new Error('Method not implemented.');
  }
}

scheincriteriaService.registerBluePrint(new AttendanceCriteria(false, 0));
