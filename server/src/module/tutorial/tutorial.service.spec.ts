import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DateTime } from 'luxon';
import { generateObjectId } from '../../../test/helpers/test.helpers';
import { TestModule } from '../../../test/helpers/test.module';
import { MockedModel } from '../../../test/helpers/testdocument';
import {
  createDatesForTutorialAsStrings,
  TUTORIAL_DOCUMENTS,
  USER_DOCUMENTS,
} from '../../../test/mocks/documents.mock';
import {
  getAllUserDocsWithRole,
  getUserDocWithRole,
} from '../../../test/mocks/documents.mock.helpers';
import { Role } from '../../shared/model/Role';
import { Tutorial, TutorialDTO } from '../../shared/model/Tutorial';
import { TutorialModel } from '../models/tutorial.model';
import { UserService } from '../user/user.service';
import { TutorialService } from './tutorial.service';

interface AssertTutorialParams {
  expected: MockedModel<TutorialModel>;
  actual: Tutorial;
}

interface AssertTutorialListParams {
  expected: MockedModel<TutorialModel>[];
  actual: Tutorial[];
}

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
    substitutes.set(date, doc._id);
  }

  expect(actual.id).toEqual(_id);
  expect(actual.slot).toEqual(slot);
  expect(actual.tutor).toEqual(tutor?._id);

  expect(actual.students).toEqual(students.map(s => s._id));
  expect(actual.correctors).toEqual(correctors.map(c => c._id));

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
  let testModule: TestingModule;
  let service: TutorialService;

  beforeAll(async () => {
    testModule = await Test.createTestingModule({
      imports: [TestModule.forRootAsync()],
      providers: [TutorialService, UserService],
    }).compile();
  });

  afterAll(async () => {
    await testModule.close();
  });

  beforeEach(async () => {
    await testModule.get<TestModule>(TestModule).reset();

    service = testModule.get<TutorialService>(TutorialService);
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

    assertTutorial({ expected: TUTORIAL_DOCUMENTS[0], actual: tutorial.toDTO([]) });
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
      dates: createDatesForTutorialAsStrings(),
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
      tutorId: USER_DOCUMENTS[1]._id,
      startTime: DateTime.fromISO('09:45:00', { zone: 'utc' }).toJSON(),
      endTime: DateTime.fromISO('11:15:00', { zone: 'utc' }).toJSON(),
      dates: createDatesForTutorialAsStrings(),
      correctorIds: [],
    };

    const tutorial = await service.create(dto);

    expect(tutorial.tutor).toEqual(tutorDoc._id);
  });

  it('create a tutorial with correctors', async () => {
    const correctorDocs = getAllUserDocsWithRole(Role.CORRECTOR);

    const dto: TutorialDTO = {
      slot: 'Tutorial 3',
      tutorId: undefined,
      startTime: DateTime.fromISO('09:45:00', { zone: 'utc' }).toJSON(),
      endTime: DateTime.fromISO('11:15:00', { zone: 'utc' }).toJSON(),
      dates: createDatesForTutorialAsStrings(),
      correctorIds: correctorDocs.map(corrector => corrector._id),
    };

    const tutorial = await service.create(dto);

    expect(tutorial.correctors).toEqual(correctorDocs.map(corrector => corrector._id));
  });

  it('create a tutorial with tutor and correctors', async () => {
    const tutorDoc = getUserDocWithRole(Role.TUTOR);
    const correctorDocs = getAllUserDocsWithRole(Role.CORRECTOR);

    const dto: TutorialDTO = {
      slot: 'Tutorial 3',
      tutorId: tutorDoc._id,
      startTime: DateTime.fromISO('09:45:00', { zone: 'utc' }).toJSON(),
      endTime: DateTime.fromISO('11:15:00', { zone: 'utc' }).toJSON(),
      dates: createDatesForTutorialAsStrings(),
      correctorIds: correctorDocs.map(corrector => corrector._id),
    };

    const tutorial = await service.create(dto);

    expect(tutorial.tutor).toEqual(tutorDoc._id);
    expect(tutorial.correctors).toEqual(correctorDocs.map(corrector => corrector._id));
  });

  it('fail on creating a tutorial with a non tutor', async () => {
    const tutorDoc = getUserDocWithRole(Role.ADMIN);

    const dto: TutorialDTO = {
      slot: 'Tutorial 3',
      tutorId: tutorDoc._id,
      startTime: DateTime.fromISO('09:45:00', { zone: 'utc' }).toJSON(),
      endTime: DateTime.fromISO('11:15:00', { zone: 'utc' }).toJSON(),
      dates: createDatesForTutorialAsStrings(),
      correctorIds: [],
    };

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });

  it('fail on creating a tutorial with a non corrector', async () => {
    const tutorDoc = getUserDocWithRole(Role.ADMIN);
    const correctors = getAllUserDocsWithRole(Role.CORRECTOR).map(corrector => corrector._id);

    const dto: TutorialDTO = {
      slot: 'Tutorial 3',
      tutorId: undefined,
      startTime: DateTime.fromISO('09:45:00', { zone: 'utc' }).toJSON(),
      endTime: DateTime.fromISO('11:15:00', { zone: 'utc' }).toJSON(),
      dates: createDatesForTutorialAsStrings(),
      correctorIds: [...correctors, tutorDoc._id],
    };

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });
});
