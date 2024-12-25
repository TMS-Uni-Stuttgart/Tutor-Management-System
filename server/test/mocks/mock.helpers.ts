import { DateTime } from 'luxon';

/**
 * Creates a few days each one week apart starting at the given date (or 2020-02-17).
 *
 * Those days are returned in their JSON string format.
 *
 * @param startISODate (_default: '2020-02-17'_) An optional starting date for the created dates.
 *
 * @returns 10 days as JS Dates.
 */
export function createDatesForTutorial(startISODate: string = '2020-02-17'): DateTime[] {
    const baseDate = DateTime.fromISO(startISODate);
    const dates: DateTime[] = [];

    for (let i = 0; i < 10; i++) {
        dates.push(baseDate.plus({ weeks: i }));
    }

    return dates;
}

/**
 * Creates a few days each one week apart starting at the given date (or 2020-02-17).
 *
 * Those days are returned in their JSON string format.
 *
 * @param startISODate (_default: '2020-02-17'_) An optional starting date for the created dates.
 *
 * @returns 10 days in JSON string format.
 */
export function createDatesForTutorialAsStrings(startISODate: string = '2020-02-17'): string[] {
    const baseDate = DateTime.fromISO(startISODate);
    const dates: DateTime[] = [];

    for (let i = 0; i < 10; i++) {
        dates.push(baseDate.plus({ weeks: i }));
    }

    return dates.map((date) => date.toISODate() ?? 'DATE_NOTE_PARSEABLE');
}
