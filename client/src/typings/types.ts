import { ScheinCriteriaSummary } from 'shared/model/ScheinCriteria';

export interface StudentByTutorialSlotSummaryMap {
    [tutorialSlot: string]: ScheinCriteriaSummary[];
}
