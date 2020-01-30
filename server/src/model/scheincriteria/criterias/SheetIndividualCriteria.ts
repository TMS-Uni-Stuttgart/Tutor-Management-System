import { PassedState, ScheinCriteriaUnit } from 'shared/dist/model/ScheinCriteria';
import { Sheet } from 'shared/dist/model/Sheet';
import * as Yup from 'yup';
import { CleanCriteriaShape } from '../../../helpers/typings';
import scheincriteriaService from '../../../services/scheincriteria-service/ScheincriteriaService.class';
import sheetService from '../../../services/sheet-service/SheetService.class';
import { StudentDocument } from '../../documents/StudentDocument';
import { CriteriaInformationWithoutName, StatusCheckResponse } from '../Scheincriteria';
import { ScheincriteriaPossiblePercentage } from '../ScheincriteriaDecorators';
import {
  PossiblePercentageCriteria,
  possiblePercentageCriteriaSchema,
} from './PossiblePercentageCriteria';

export class SheetIndividualCriteria extends PossiblePercentageCriteria {
  @ScheincriteriaPossiblePercentage('percentagePerSheet')
  readonly valuePerSheetNeeded: number;
  readonly percentagePerSheet: boolean;

  constructor(
    percentage: boolean,
    valueNeeded: number,
    percentagePerSheet: boolean,
    valuePerSheetNeeded: number
  ) {
    super('sheetIndividual', percentage, valueNeeded);

    this.valuePerSheetNeeded = valuePerSheetNeeded;
    this.percentagePerSheet = percentagePerSheet;
  }

  async checkCriteriaStatus(student: StudentDocument): Promise<StatusCheckResponse> {
    const sheets = await sheetService.getAllSheets();
    const infos: StatusCheckResponse['infos'] = {};
    const totalSheetCount = sheets.reduce((count, sheet) => count + (sheet.bonusSheet ? 0 : 1), 0);
    const sheetsPassed = await this.checkAllSheets(sheets, student, infos);

    let passed: boolean = false;

    if (this.percentage) {
      passed = sheetsPassed / totalSheetCount >= this.valueNeeded;
    } else {
      passed = sheetsPassed >= this.valueNeeded;
    }

    return {
      identifier: this.identifier,
      achieved: sheetsPassed,
      total: totalSheetCount,
      passed,
      infos,
      unit: ScheinCriteriaUnit.SHEET,
    };
  }

  async getInformation(students: StudentDocument[]): Promise<CriteriaInformationWithoutName> {
    throw new Error('Method not implemented.');
  }

  private async checkAllSheets(
    sheets: Sheet[],
    student: StudentDocument,
    infos: StatusCheckResponse['infos']
  ) {
    let sheetsPassed = 0;
    for (const sheet of sheets) {
      const achieved = await sheetService.getPointsOfStudent(student, sheet);
      const total = sheetService.getSheetTotalPoints(sheet);

      let state = PassedState.NOTPASSED;

      if (this.percentagePerSheet) {
        if (achieved / total >= this.valuePerSheetNeeded) {
          state = PassedState.PASSED;
        }
      } else {
        if (achieved >= this.valuePerSheetNeeded) {
          state = PassedState.PASSED;
        }
      }

      if (state === PassedState.PASSED) {
        sheetsPassed += 1;
      }

      infos[sheet.id] = {
        achieved,
        total,
        no: sheet.sheetNo,
        state,
        unit: ScheinCriteriaUnit.POINT,
      };
    }

    return sheetsPassed;
  }
}

const sheetIndividualCriteriaSchema = Yup.object()
  .shape<CleanCriteriaShape<SheetIndividualCriteria, PossiblePercentageCriteria>>({
    percentagePerSheet: Yup.boolean().required(),
    valuePerSheetNeeded: Yup.number()
      .min(0)
      .required(),
  })
  .concat(possiblePercentageCriteriaSchema);

scheincriteriaService.registerBluePrint(
  new SheetIndividualCriteria(false, 0, false, 0),
  sheetIndividualCriteriaSchema
);
