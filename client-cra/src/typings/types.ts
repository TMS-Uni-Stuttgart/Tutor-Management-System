import { HasId } from 'shared/model/Common';
import { ScheinCriteriaSummary } from 'shared/model/ScheinCriteria';
import { Grading } from '../model/Grading';

export interface HasGradings extends HasId {
  getGrading(entity: HasId): Grading | undefined;
}

export interface StudentByTutorialSlotSummaryMap {
  [tutorialSlot: string]: ScheinCriteriaSummary[];
}
