import { AttendanceState } from 'shared/dist/model/Attendance';
import { ScheinCriteriaUnit } from 'shared/dist/model/ScheinCriteria';
import scheincriteriaService from '../../../services/scheincriteria-service/ScheincriteriaService.class';
import tutorialService from '../../../services/tutorial-service/TutorialService.class';
import { StudentDocument } from '../../documents/StudentDocument';
import { CriteriaInformationWithoutName, StatusCheckResponse } from '../Scheincriteria';
import {
  PossiblePercentageCriteria,
  possiblePercentageCriteriaSchema,
} from './PossiblePercentageCriteria';
import { getIdOfDocumentRef } from '../../../helpers/documentHelpers';

export class AttendanceCriteria extends PossiblePercentageCriteria {
  constructor(percentage: boolean, valueNeeded: number) {
    super('attendance', percentage, valueNeeded);
  }

  async checkCriteriaStatus(student: StudentDocument): Promise<StatusCheckResponse> {
    const tutorial = await tutorialService.getDocumentWithID(getIdOfDocumentRef(student.tutorial));
    const total = tutorial.dates.length;

    let visitedOrExcused = 0;

    Object.values(student.attendance).forEach(({ state }) => {
      if (state === AttendanceState.PRESENT || state === AttendanceState.EXCUSED) {
        visitedOrExcused += 1;
      }
    });

    const passed: boolean = this.percentage
      ? visitedOrExcused / total > this.valueNeeded
      : visitedOrExcused > this.valueNeeded;

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
