import { ISheet } from 'shared/model/Sheet';
import { HasExercises } from './Exercise';

export class Sheet extends HasExercises implements ISheet {
  readonly id!: string;
  readonly sheetNo!: number;
  readonly bonusSheet!: boolean;

  toDisplayString(): string {
    return `Übungsblatt #${this.sheetNo.toString().padStart(2, '0')}`;
  }
}
