import { AttendanceState } from '../../../../shared/model/Attendance';
import { ScheinCriteriaUnit } from '../../../../shared/model/ScheinCriteria';
import {
  CriteriaInformationWithoutName,
  CriteriaPayload,
  InformationPayload,
  StatusCheckResponse,
} from '../Scheincriteria';
import { PossiblePercentageCriteria } from './PossiblePercentageCriteria';

export class AttendanceCriteria extends PossiblePercentageCriteria {
  constructor(percentage: boolean = false, valueNeeded: number = 0) {
    super('attendance', percentage, valueNeeded);
  }

  checkCriteriaStatus({ student }: CriteriaPayload): StatusCheckResponse {
    // const tutorial = await tutorialService.getDocumentWithID(getIdOfDocumentRef(student.tutorial));
    // const total = tutorial.dates.length;

    let total = 0;
    let visitedOrExcused = 0;

    student.attendances.forEach(({ state }) => {
      total += 1;

      if (state === AttendanceState.PRESENT || state === AttendanceState.EXCUSED) {
        visitedOrExcused += 1;
      }
    });

    const passed: boolean = this.percentage
      ? visitedOrExcused / total >= this.valueNeeded
      : visitedOrExcused >= this.valueNeeded;

    return {
      identifier: this.identifier,
      achieved: visitedOrExcused,
      total,
      passed,
      unit: ScheinCriteriaUnit.DATE,
      infos: {},
    };
  }

  getInformation(payload: InformationPayload): CriteriaInformationWithoutName {
    throw new Error('Method not implemented.');
  }
}
