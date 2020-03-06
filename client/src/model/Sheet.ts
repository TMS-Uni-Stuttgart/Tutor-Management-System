import { ISheet } from '../../../server/src/shared/model/Sheet';
import { HasExercises } from './Exercise';

export class Sheet extends HasExercises implements ISheet {
  id!: string;
  sheetNo!: number;
  bonusSheet!: boolean;
}
