import { Tutorial } from '../../../model/Tutorial';

export abstract class TutorialSorter {
    abstract sort(tutorials: Tutorial[]): Tutorial[];
}

export class AlphabeticTutorialSorter extends TutorialSorter {
    sort(tutorials: Tutorial[]): Tutorial[] {
        const sortedTutorials = [...tutorials];
        return sortedTutorials.sort((a, b) =>
            a.toDisplayString().localeCompare(b.toDisplayString())
        );
    }
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
                return dateA.diff(dateB, 'days').days;
            }
        });
    }
}

export type SupportedSorters = 'alphabetical' | 'date';
type Sorters = {
    readonly [K in SupportedSorters]: TutorialSorter;
};

export const SORTERS: Sorters = {
    alphabetical: new AlphabeticTutorialSorter(),
    date: new DateTutorialSorter(),
};
