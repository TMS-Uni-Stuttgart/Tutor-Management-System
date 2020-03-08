import { SheetDocument } from '../../../../database/models/sheet.model';
import { StudentDocument } from '../../../../database/models/student.model';
import {
  PassedState,
  ScheincriteriaIdentifier,
  ScheinCriteriaUnit,
} from '../../../../shared/model/ScheinCriteria';
import {
  CriteriaInformationWithoutName,
  CriteriaPayload,
  InformationPayload,
  StatusCheckResponse,
} from '../Scheincriteria';
import { PossiblePercentageCriteria } from './PossiblePercentageCriteria';

export class SheetTotalCriteria extends PossiblePercentageCriteria {
  constructor(percentage: boolean, valueNeeded: number) {
    super(ScheincriteriaIdentifier.SHEET_TOTAL, percentage, valueNeeded);
  }

  checkCriteriaStatus({ student, sheets }: CriteriaPayload): StatusCheckResponse {
    const infos: StatusCheckResponse['infos'] = {};
    const { pointsAchieved, pointsTotal } = this.checkAllSheets(sheets, student, infos);

    let passed: boolean = false;

    if (this.percentage) {
      passed = pointsAchieved / pointsTotal >= this.valueNeeded;
    } else {
      passed = pointsAchieved >= this.valueNeeded;
    }

    return {
      identifier: this.identifier,
      achieved: pointsAchieved,
      total: pointsTotal,
      passed,
      unit: ScheinCriteriaUnit.POINT,
      infos,
    };
  }

  getInformation(payload: InformationPayload): CriteriaInformationWithoutName {
    throw new Error('Method not implemented.');
  }

  private checkAllSheets(
    sheets: SheetDocument[],
    student: StudentDocument,
    infos: StatusCheckResponse['infos']
  ) {
    let pointsAchieved = 0;
    let pointsTotal = 0;

    for (const sheet of sheets) {
      const achieved = student.getGrading(sheet)?.points ?? 0;
      const total = sheet.totalPoints;
      pointsAchieved += achieved;

      if (!sheet.bonusSheet) {
        pointsTotal += total;
      }

      infos[sheet.id] = {
        achieved,
        total,
        no: sheet.sheetNo,
        unit: ScheinCriteriaUnit.POINT,
        state: PassedState.IGNORE,
      };
    }

    return { pointsAchieved, pointsTotal };
  }
}
