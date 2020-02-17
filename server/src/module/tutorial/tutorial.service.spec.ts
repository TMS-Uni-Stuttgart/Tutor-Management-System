import { Test, TestingModule } from '@nestjs/testing';
import { DateTime } from 'luxon';
import { createMockModel } from '../../../test/helpers/test.create-mock-model';
import { MongooseMockModelProvider } from '../../../test/helpers/test.provider';
import { MockedModel } from '../../../test/helpers/testdocument';
import {
  MockedUserService,
  USER_DOCUMENTS,
  getUserDocWithRole,
  getAllUserDocsWithRole,
} from '../../../test/mocks/user.service.mock';
import { Tutorial, TutorialDTO } from '../../shared/model/Tutorial';
import { TutorialModel } from '../models/tutorial.model';
import { UserDocument } from '../models/user.model';
import { UserService } from '../user/user.service';
import { TutorialService } from './tutorial.service';
import { Role } from '../../shared/model/Role';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { generateObjectId } from '../../../test/helpers/test.helpers';

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

  it('find a tutorial by id', async () => {
    const tutorial = await service.findById(TUTORIAL_DOCUMENTS[0]._id);

    expect(tutorial).toEqual(TUTORIAL_DOCUMENTS[0]);
  });

  it('fail on finding non existing tutorial (by ID)', async () => {
    const nonExistingId = generateObjectId();

    await expect(service.findById(nonExistingId)).rejects.toThrow(NotFoundException);
  });

  it('create a tutorial without a tutor', async () => {
    const dto: TutorialDTO = {
      slot: 'Tutorial 3',
      tutorId: undefined,
      startTime: DateTime.fromISO('09:45:00', { zone: 'utc' }).toJSON(),
      endTime: DateTime.fromISO('11:15:00', { zone: 'utc' }).toJSON(),
      dates: createDatesForTutorial(),
      correctorIds: [],
    };

    const tutorial = await service.create(dto);
    const {
      id,
      tutor,
      startTime,
      endTime,
      students,
      correctors,
      substitutes,
      teams,
      ...actual
    } = tutorial;
    const {
      tutorId,
      startTime: expectedStart,
      endTime: expectedEnd,
      correctorIds,
      ...expected
    } = dto;

    expect(id).toBeDefined();
    expect(tutor).toBeUndefined();

    expect(startTime.toJSON()).toEqual(expectedStart);
    expect(endTime.toJSON()).toEqual(expectedEnd);

    expect(teams).toEqual([]);
    expect(students).toEqual([]);
    expect(correctors).toEqual([]);
    expect(substitutes).toEqual([]);

    expect(actual).toEqual(expected);
  });

  it('create a tutorial with a tutor', async () => {
    const tutorDoc = getUserDocWithRole(Role.TUTOR);

    const dto: TutorialDTO = {
      slot: 'Tutorial 3',
      tutorId: tutorDoc.id,
      startTime: DateTime.fromISO('09:45:00', { zone: 'utc' }).toJSON(),
      endTime: DateTime.fromISO('11:15:00', { zone: 'utc' }).toJSON(),
      dates: createDatesForTutorial(),
      correctorIds: [],
    };

    const tutorial = await service.create(dto);

    expect(tutorial.tutor).toEqual(tutorDoc.id);
  });

  it('create a tutorial with correctors', async () => {
    const correctorDocs = getAllUserDocsWithRole(Role.CORRECTOR);

    const dto: TutorialDTO = {
      slot: 'Tutorial 3',
      tutorId: undefined,
      startTime: DateTime.fromISO('09:45:00', { zone: 'utc' }).toJSON(),
      endTime: DateTime.fromISO('11:15:00', { zone: 'utc' }).toJSON(),
      dates: createDatesForTutorial(),
      correctorIds: correctorDocs.map(corrector => corrector.id),
    };

    const tutorial = await service.create(dto);

    expect(tutorial.correctors).toEqual(correctorDocs.map(corrector => corrector.id));
  });

  it('create a tutorial with tutor and correctors', async () => {
    const tutorDoc = getUserDocWithRole(Role.TUTOR);
    const correctorDocs = getAllUserDocsWithRole(Role.CORRECTOR);

    const dto: TutorialDTO = {
      slot: 'Tutorial 3',
      tutorId: tutorDoc.id,
      startTime: DateTime.fromISO('09:45:00', { zone: 'utc' }).toJSON(),
      endTime: DateTime.fromISO('11:15:00', { zone: 'utc' }).toJSON(),
      dates: createDatesForTutorial(),
      correctorIds: correctorDocs.map(corrector => corrector.id),
    };

    const tutorial = await service.create(dto);

    expect(tutorial.tutor).toEqual(tutorDoc.id);
    expect(tutorial.correctors).toEqual(correctorDocs.map(corrector => corrector.id));
  });

  it('fail on creating a tutorial with a non tutor', async () => {
    const tutorDoc = getUserDocWithRole(Role.ADMIN);

    const dto: TutorialDTO = {
      slot: 'Tutorial 3',
      tutorId: tutorDoc.id,
      startTime: DateTime.fromISO('09:45:00', { zone: 'utc' }).toJSON(),
      endTime: DateTime.fromISO('11:15:00', { zone: 'utc' }).toJSON(),
      dates: createDatesForTutorial(),
      correctorIds: [],
    };

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });

  it('fail on creating a tutorial with a non corrector', async () => {
    const tutorDoc = getUserDocWithRole(Role.ADMIN);
    const correctors = getAllUserDocsWithRole(Role.CORRECTOR).map(corrector => corrector.id);

    const dto: TutorialDTO = {
      slot: 'Tutorial 3',
      tutorId: undefined,
      startTime: DateTime.fromISO('09:45:00', { zone: 'utc' }).toJSON(),
      endTime: DateTime.fromISO('11:15:00', { zone: 'utc' }).toJSON(),
      dates: createDatesForTutorial(),
      correctorIds: [...correctors, tutorDoc.id],
    };

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });
});

/**
 * Creates a few days each one week apart starting at 2020-02-17 (utc time zone).
 *
 * Those days are returned in their JSON string format.
 *
 * @returns 10 days in JSON string format.
 */
function createDatesForTutorial(): string[] {
  const baseDate = DateTime.fromISO('2020-02-17', { zone: 'utc' });
  const dates: DateTime[] = [];

  for (let i = 0; i < 10; i++) {
    dates.push(baseDate.plus({ weeks: i }));
  }

  return dates.map(date => date.toJSON());
}
