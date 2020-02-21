import { TutorialModel } from '../../src/module/models/tutorial.model';
import { generateObjectId } from '../helpers/test.helpers';
import { TestDocument } from '../helpers/testdocument';
import { DateTime } from 'luxon';
import { NotFoundException } from '@nestjs/common';

const TUTORIAL_DOCUMENTS: readonly TestDocument<TutorialModel>[] = [
  {
    id: generateObjectId(),
    tutor: undefined,
    slot: 'Tutorial 1',
    students: [],
    correctors: [],
    dates: createDatesForTutorial('2020-02-18'),
    startTime: DateTime.fromISO('08:00:00', { zone: 'utc' }).toJSDate(),
    endTime: DateTime.fromISO('09:30:00', { zone: 'utc' }).toJSDate(),
    substitutes: new Map(),
  },
  {
    id: generateObjectId(),
    tutor: undefined,
    slot: 'Tutorial 2',
    students: [],
    correctors: [],
    dates: createDatesForTutorial('2020-02-21'),
    startTime: DateTime.fromISO('14:00:00', { zone: 'utc' }).toJSDate(),
    endTime: DateTime.fromISO('15:30:00', { zone: 'utc' }).toJSDate(),
    substitutes: new Map(),
  },
];

export class MockedTutorialService {
  static getOneDocument(): TestDocument<TutorialModel> {
    return TUTORIAL_DOCUMENTS[0];
  }

  findById(id: string): TestDocument<TutorialModel> {
    for (const tutorial of TUTORIAL_DOCUMENTS) {
      if (tutorial.id === id) {
        return tutorial;
      }
    }

    throw new NotFoundException(`Mocked tutorial with ID '${id} could not be found.'`);
  }
}

/**
 * Creates a few days each one week apart starting at the given date (or 2020-02-17).
 *
 * Those days are returned in their JSON string format.
 *
 * @param startISODate (_default: '2020-02-17'_) An optional starting date for the created dates.
 *
 * @returns 10 days as JS Dates.
 */
export function createDatesForTutorial(startISODate: string = '2020-02-17'): Date[] {
  const baseDate = DateTime.fromISO(startISODate, { zone: 'utc' });
  const dates: DateTime[] = [];

  for (let i = 0; i < 10; i++) {
    dates.push(baseDate.plus({ weeks: i }));
  }

  return dates.map(date => date.toJSDate());
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
  const baseDate = DateTime.fromISO(startISODate, { zone: 'utc' });
  const dates: DateTime[] = [];

  for (let i = 0; i < 10; i++) {
    dates.push(baseDate.plus({ weeks: i }));
  }

  return dates.map(date => date.toJSON());
}
