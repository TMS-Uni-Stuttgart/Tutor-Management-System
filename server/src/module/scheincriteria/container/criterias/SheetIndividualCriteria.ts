import { IsBoolean } from 'class-validator';
import { SheetDocument } from '../../../../database/models/sheet.model';
import { StudentDocument } from '../../../../database/models/student.model';
import { IsNonNegativeNumberValue } from '../../../../helpers/validators/nonNegativeNumberValue.validator';
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
import { ScheincriteriaPossiblePercentage } from '../scheincriteria.decorators';
import { PossiblePercentageCriteria } from './PossiblePercentageCriteria';

export class SheetIndividualCriteria extends PossiblePercentageCriteria {
    @IsNonNegativeNumberValue({ isFloat: true })
    @ScheincriteriaPossiblePercentage('percentagePerSheet')
    readonly valuePerSheetNeeded: number;

    @IsBoolean()
    readonly percentagePerSheet: boolean;

    constructor(
        percentage: boolean,
        valueNeeded: number,
        percentagePerSheet: boolean,
        valuePerSheetNeeded: number
    ) {
        super(ScheincriteriaIdentifier.SHEET_INDIVIDUAL, percentage, valueNeeded);

        this.valuePerSheetNeeded = valuePerSheetNeeded;
        this.percentagePerSheet = percentagePerSheet;
    }

    checkCriteriaStatus({ student, sheets }: CriteriaPayload): StatusCheckResponse {
        const infos: StatusCheckResponse['infos'] = {};
        const totalSheetCount = sheets.reduce(
            (count, sheet) => count + (sheet.bonusSheet ? 0 : 1),
            0
        );
        const sheetsPassed = this.checkAllSheets(sheets, student, infos);

        let passed: boolean;

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

    getInformation(payload: InformationPayload): CriteriaInformationWithoutName {
        throw new Error('Method not implemented.');
    }

    private checkAllSheets(
        sheets: SheetDocument[],
        student: StudentDocument,
        infos: StatusCheckResponse['infos']
    ): number {
        let sheetsPassed = 0;
        for (const sheet of sheets) {
            const achieved = student.getGrading(sheet)?.points ?? 0;
            const total = sheet.totalPoints.must;

            let state = PassedState.NOT_PASSED;

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
