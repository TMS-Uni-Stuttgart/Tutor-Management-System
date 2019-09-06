import { Student } from 'shared/dist/model/Student';
import scheincriteriaService from '../../../services/scheincriteria-service/ScheincriteriaService.class';
import { StatusCheckResponse } from '../Scheincriteria';
import {
  PossiblePercentageCriteria,
  possiblePercentageCriteriaSchema,
} from './PossiblePercentageCriteria';
import tutorialService from '../../../services/tutorial-service/TutorialService.class';
import { AttendanceState } from 'shared/dist/model/Attendance';
import { ScheinCriteriaUnit } from 'shared/dist/model/ScheinCriteria';

export class AttendanceCriteria extends PossiblePercentageCriteria {
  constructor(percentage: boolean, valueNeeded: number) {
    super('attendance', percentage, valueNeeded);
  }

  isPassed(student: Student): boolean {
    // TODO: Remove me!
    throw new Error('Method not implemented.');
  }

  async checkCriteriaStatus(student: Student): Promise<StatusCheckResponse> {
    const tutorial = await tutorialService.getDocumentWithID(student.tutorial);
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

    throw new Error('Method not implemented.');
  }
}

scheincriteriaService.registerBluePrint(
  new AttendanceCriteria(false, 0),
  possiblePercentageCriteriaSchema
);
