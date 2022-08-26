import {PassedState, ScheincriteriaIdentifier, ScheinCriteriaUnit,} from 'shared/model/ScheinCriteria';
import {Sheet} from '../../../../database/entities/sheet.entity';
import {
    CriteriaInformationWithoutName,
    CriteriaPayload,
    InformationPayload,
    StatusCheckResponse,
} from '../Scheincriteria';
import {PossiblePercentageCriteria} from './PossiblePercentageCriteria';
import {GradingList} from '../../../../helpers/GradingList';

export class SheetTotalCriteria extends PossiblePercentageCriteria {
    constructor(percentage: boolean, valueNeeded: number) {
        super(ScheincriteriaIdentifier.SHEET_TOTAL, percentage, valueNeeded);
    }

    checkCriteriaStatus({gradings, sheets}: CriteriaPayload): StatusCheckResponse {
        const infos: StatusCheckResponse['infos'] = {};
        const {pointsAchieved, pointsTotal} = this.checkAllSheets(sheets, gradings, infos);

        let passed: boolean;

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
            infos,
            unit: ScheinCriteriaUnit.POINT,
            chartType: 'PieChart',
        };
    }

    getInformation(payload: InformationPayload): CriteriaInformationWithoutName {
        throw new Error('Method not implemented.');
    }

    private checkAllSheets(
        sheets: Sheet[],
        gradings: GradingList,
        infos: StatusCheckResponse['infos']
    ) {
        let pointsAchieved = 0;
        let pointsTotal = 0;

        for (const sheet of sheets) {
            const achieved = gradings.getGradingOfHandIn(sheet)?.points ?? 0;
            const total = sheet.totalPoints.must;
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
