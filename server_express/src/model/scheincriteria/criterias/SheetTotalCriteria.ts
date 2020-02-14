import { PassedState, ScheinCriteriaUnit } from 'shared/dist/model/ScheinCriteria';
import { Sheet } from 'shared/dist/model/Sheet';
import scheincriteriaService from '../../../services/scheincriteria-service/ScheincriteriaService.class';
import sheetService from '../../../services/sheet-service/SheetService.class';
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

export class SheetTotalCriteria extends PossiblePercentageCriteria {
  constructor(percentage: boolean, valueNeeded: number) {
    super('sheetTotal', percentage, valueNeeded);
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

  async getInformation(students: StudentDocument[]): Promise<CriteriaInformationWithoutName> {
    throw new Error('Method not implemented.');
  }

  private checkAllSheets(
    sheets: Sheet[],
    student: StudentDocument,
    infos: StatusCheckResponse['infos']
  ) {
    let pointsAchieved = 0;
    let pointsTotal = 0;

    for (const sheet of sheets) {
      const achieved = sheetService.getPointsOfStudent(student, sheet);
      const total = sheetService.getSheetTotalPoints(sheet);
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

scheincriteriaService.registerBluePrint(
  new SheetTotalCriteria(false, 0),
  possiblePercentageCriteriaSchema
);
