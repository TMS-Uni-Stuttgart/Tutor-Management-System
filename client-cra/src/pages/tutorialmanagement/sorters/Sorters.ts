import { Tutorial } from '../../../model/Tutorial';

export abstract class TutorialSorter {
  abstract sort(tutorials: Tutorial[]): Tutorial[];
}

export class DateTutorialSorter extends TutorialSorter {
  sort(tutorials: Tutorial[]): Tutorial[] {
    return [...tutorials].sort((a, b) => {
      const dateA = a.dates[0];
      const dateB = b.dates[0];

      if (!dateA && !dateB) {
        return 0;
      } else if (!dateA) {
        return -1;
      } else if (!dateB) {
        return 1;
      } else {
        const diff = dateA.weekday - dateB.weekday;
        return diff === 0 ? a.toDisplayString().localeCompare(b.toDisplayString()) : diff;
      }
    });
  }
}

export type SupportedSorters = 'date';
type Sorters = {
  readonly [K in SupportedSorters]: TutorialSorter;
};

export const SORTERS: Sorters = {
  date: new DateTutorialSorter(),
};
