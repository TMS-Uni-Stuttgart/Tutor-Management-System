import { Type } from 'class-transformer';
import { ISheet } from '../../../server/src/shared/model/Sheet';
import { Exercise } from './Exercise';

export class Sheet implements ISheet {
  id!: string;
  sheetNo!: number;
  bonusSheet!: boolean;

  @Type(() => Exercise)
  exercises!: Exercise[];

  /**
   * Total points of the sheet. This is equal to the sum of the points of all exercises in this sheet.
   */
  get totalPoints(): number {
    return this.exercises.reduce((sum, current) => sum + current.points, 0);
  }
}
