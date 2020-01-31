import { AttendanceState } from 'shared/dist/model/Attendance';
import { ScheinCriteriaUnit } from 'shared/dist/model/ScheinCriteria';
import scheincriteriaService from '../../../services/scheincriteria-service/ScheincriteriaService.class';
import { StudentDocument } from '../../documents/StudentDocument';
import {
  CriteriaInformationWithoutName,
  CriteriaPayload,
  StatusCheckResponse,
} from '../Scheincriteria';
import {
  PossiblePercentageCriteria,
  possiblePercentageCriteriaSchema,
} from './PossiblePercentageCriteria';

export class AttendanceCriteria extends PossiblePercentageCriteria {
  constructor(percentage: boolean, valueNeeded: number) {
    super('attendance', percentage, valueNeeded);
  }

  checkCriteriaStatus({ student }: CriteriaPayload): StatusCheckResponse {
    // const tutorial = await tutorialService.getDocumentWithID(getIdOfDocumentRef(student.tutorial));
    // const total = tutorial.dates.length;

    let total = 0;
    let visitedOrExcused = 0;

    student.attendance.forEach(({ state }) => {
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

  async getInformation(students: StudentDocument[]): Promise<CriteriaInformationWithoutName> {
    throw new Error('Method not implemented.');
  }
}

scheincriteriaService.registerBluePrint(
  new AttendanceCriteria(false, 0),
  possiblePercentageCriteriaSchema
);
