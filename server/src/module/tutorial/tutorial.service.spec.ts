import { NotImplementedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { generateObjectId } from '../../../test/helpers/test.helpers';
import { MongooseMockModelProvider } from '../../../test/helpers/test.provider';
import { MockedModel } from '../../../test/helpers/testdocument';
import { Tutorial } from '../../shared/model/Tutorial';
import { TutorialModel } from '../models/tutorial.model';
import { UserService } from '../user/user.service';
import { TutorialService } from './tutorial.service';
import { MockedUserService, USER_DOCUMENTS } from '../../../test/mocks/user.service.mock';
import { createMockModel } from '../../../test/helpers/test.create-mock-model';
import { UserDocument } from '../models/user.model';

interface AssertTutorialParams {
  expected: MockedModel<TutorialModel>;
  actual: Tutorial;
}

interface AssertTutorialListParams {
  expected: MockedModel<TutorialModel>[];
  actual: Tutorial[];
}

const TUTORIAL_DOCUMENTS: MockedModel<TutorialModel>[] = [
  createMockModel(
    new TutorialModel({
      tutor: undefined,
      slot: 'Tutorial 1',
      students: [],
      correctors: [],
      dates: [new Date()],
      startTime: new Date(),
      endTime: new Date(),
      substitutes: new Map(),
    })
  ),
  createMockModel(
    new TutorialModel({
      tutor: USER_DOCUMENTS[0] as UserDocument,
      slot: 'Tutorial 2',
      students: [],
      correctors: [],
      dates: [new Date()],
      startTime: new Date(),
      endTime: new Date(),
      substitutes: new Map(),
    })
  ),
];

/**
 * Checks if the `expected` and the `actual` tutorials are equal.
 *
 * Equality is defined as they have to be equal in all their properties. However, all properties of `expected` are converted in a format that their counterpart in `actual` is in.
 *
 * @param options Must contain the expected tutorial and the actual one.
 */
function assertTutorial({ expected, actual }: AssertTutorialParams) {
  const { _id, dates, startTime, endTime, slot, tutor, students, correctors } = expected;

  const substitutes: Map<string, string> = new Map();

  for (const [date, doc] of expected.substitutes.entries()) {
    substitutes.set(date, doc.id);
  }

  expect(actual.id).toEqual(_id);
  expect(actual.slot).toEqual(slot);
  expect(actual.tutor).toEqual(tutor?.id);

  expect(actual.students).toEqual(students.map(s => s.id));
  expect(actual.correctors).toEqual(correctors.map(c => c.id));

  expect(actual.dates).toEqual(dates.map(date => date.toJSON()));
  expect(actual.startTime).toEqual(startTime);
  expect(actual.endTime).toEqual(endTime);

  expect(actual.substitutes).toEqual([...substitutes]);
}

function assertTutorialList({ expected, actual }: AssertTutorialListParams) {
  expect(actual.length).toBe(expected.length);

  for (let i = 0; i < actual.length; i++) {
    assertTutorial({
      expected: expected[i],
      actual: actual[i],
    });
  }
}

describe('TutorialService', () => {
  let service: TutorialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TutorialService,
        {
          provide: UserService,
          useClass: MockedUserService,
        },
        MongooseMockModelProvider.create({
          modelClass: TutorialModel,
          documents: TUTORIAL_DOCUMENTS,
        }),
      ],
    }).compile();

    service = module.get<TutorialService>(TutorialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('find all tutorials', async () => {
    const allTutorials: Tutorial[] = await service.findAll();

    assertTutorialList({ expected: TUTORIAL_DOCUMENTS, actual: allTutorials });
  });
});
