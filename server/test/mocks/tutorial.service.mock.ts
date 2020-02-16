import { TutorialModel } from '../../src/module/models/tutorial.model';
import { generateObjectId } from '../helpers/test.helpers';
import { TestDocument } from '../helpers/testdocument';

export const TUTORIAL_DOCUMENTS: readonly TestDocument<TutorialModel>[] = [
  {
    id: generateObjectId(),
    tutor: undefined,
    slot: 'Test 1',
    students: [],
    correctors: [],
    dates: [new Date()],
    startTime: new Date(),
    endTime: new Date(),
    substitutes: new Map(),
  },
  {
    id: generateObjectId(),
    tutor: undefined,
    slot: 'Test 2',
    students: [],
    correctors: [],
    dates: [new Date()],
    startTime: new Date(),
    endTime: new Date(),
    substitutes: new Map(),
  },
];

export class MockedTutorialService {
  findById(id: string): TestDocument<TutorialModel> {
    for (const tutorial of TUTORIAL_DOCUMENTS) {
      if (tutorial.id === id) {
        return tutorial;
      }
    }

    throw new Error(`Mocked tutorial with ID '${id} could not be found.'`);
  }
}
