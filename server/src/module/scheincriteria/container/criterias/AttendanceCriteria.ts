import { AttendanceState } from 'shared/model/Attendance';
import { ScheincriteriaIdentifier, ScheinCriteriaUnit } from 'shared/model/ScheinCriteria';
import {
    CriteriaInformationWithoutName,
    CriteriaPayload,
    InformationPayload,
    StatusCheckResponse,
} from '../Scheincriteria';
import { PossiblePercentageCriteria } from './PossiblePercentageCriteria';

export class AttendanceCriteria extends PossiblePercentageCriteria {
    constructor(percentage: boolean, valueNeeded: number) {
        super(ScheincriteriaIdentifier.ATTENDANCE, percentage, valueNeeded);
    }

    checkCriteriaStatus({ student }: CriteriaPayload): StatusCheckResponse {
        const total = student.attendances.size;
        let visitedOrExcused = 0;

        student.attendances.forEach(({ state }) => {
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
            chartType: 'PieChart',
        };
    }

    getInformation(payload: InformationPayload): CriteriaInformationWithoutName {
        throw new Error('Method not implemented.');
    }
}
