import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DateTime, ToISOTimeOptions } from 'luxon';
import { generateObjectId } from '../../../test/helpers/test.helpers';
import { TestModule } from '../../../test/helpers/test.module';
import { MockedModel } from '../../../test/helpers/testdocument';
import {
  createDatesForTutorialAsStrings,
  TUTORIAL_DOCUMENTS,
} from '../../../test/mocks/documents.mock';
import {
  getAllUserDocsWithRole,
  getUserDocWithRole,
} from '../../../test/mocks/documents.mock.helpers';
import { TutorialModel } from '../../database/models/tutorial.model';
import { Role } from '../../shared/model/Role';
import { ITutorial, UserInEntity } from '../../shared/model/Tutorial';
import { UserService } from '../user/user.service';
import { TutorialService } from './tutorial.service';
import { TutorialDTO } from './tutorial.dto';

interface AssertTutorialParams {
  expected: MockedModel<TutorialModel>;
  actual: ITutorial;
}

interface AssertTutorialListParams {
  expected: MockedModel<TutorialModel>[];
  actual: ITutorial[];
}

interface AssertTutorialDTOParams {
  expected: TutorialDTO;
  actual: ITutorial;
  oldTutorial?: ITutorial;
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

  const substitutes: Map<string, UserInEntity> = new Map();

  // for (const [date, doc] of expected.substitutes.entries()) {
  //   substitutes.set(date, { id: doc._id, firstname: doc.firstname, lastname: doc.lastname });
  // }

  expect(actual.id).toEqual(_id);
  expect(actual.slot).toEqual(slot);
  expect(actual.tutor?.id).toEqual(tutor?._id);
  expect(actual.tutor?.firstname).toEqual(tutor?.firstname);
  expect(actual.tutor?.lastname).toEqual(tutor?.lastname);

  expect(actual.students).toEqual(students.map(s => s._id));
  expect(actual.correctors).toEqual(
    correctors.map(c => ({ id: c.id, firstname: c.firstname, lastname: c.lastname }))
  );

  const options: ToISOTimeOptions = {
    suppressMilliseconds: true,
  };

  expect(actual.dates).toEqual(dates.map(date => date.toISODate()));
  expect(actual.startTime).toEqual(startTime.toISOTime(options));
  expect(actual.endTime).toEqual(endTime.toISOTime(options));

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

/**
 * Checks if the given Tutorial and the given TutorialDTO are equal.
 *
 * Equalitiy is defined as:
 * - Dates & Times are equal as of luxon's definition of an equal date.
 * - The IDs of the correctors match.
 * - `students`, `teams` and `substitutes` are either empty (if not `oldTutorial` tutorial is provided) or match those in the `oldTutorial` tutorial.
 * - The rest of `expected` matches the rest of `actual`.
 *
 * @param params Must contain an expected TutorialDTO and an actual Tutorial. Can include an old version of the tutorial to compare `teams`, `students` and `substitutes`.
 */
function assertTutorialDTO({ expected, actual, oldTutorial }: AssertTutorialDTOParams) {
  const { id, tutor, correctors, dates, slot, students, teams, substitutes } = actual;
  const { tutorId, startTime: expectedStart, endTime: expectedEnd, correctorIds } = expected;

  expect(id).toBeDefined();
  expect(tutor?.id).toEqual(tutorId);
  expect(slot).toEqual(expected.slot);

  expect(dates).toEqual(expected.dates.map(date => DateTime.fromISO(date).toISODate()));

  const options: ToISOTimeOptions = {
    suppressMilliseconds: true,
  };

  expect(actual.startTime).toEqual(DateTime.fromISO(expectedStart).toISOTime(options));
  expect(actual.endTime).toEqual(DateTime.fromISO(expectedEnd).toISOTime(options));

  expect(correctors.map(c => c.id)).toEqual(correctorIds);

  if (!!oldTutorial) {
    expect(teams).toEqual(oldTutorial.teams);
    expect(students).toEqual(oldTutorial.students);
    expect(substitutes).toEqual(oldTutorial.substitutes);
  } else {
    expect(teams).toEqual([]);
    expect(students).toEqual([]);
    expect(substitutes).toEqual([]);
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
    const allTutorials = await service.findAll();

    assertTutorialList({
      expected: TUTORIAL_DOCUMENTS,
      actual: allTutorials.map(tutorial => tutorial.toDTO()),
    });
  });

  it('find a tutorial by id', async () => {
    const tutorial = await service.findById(TUTORIAL_DOCUMENTS[0]._id);

    assertTutorial({ expected: TUTORIAL_DOCUMENTS[0], actual: tutorial.toDTO() });
  });

  it('fail on finding non existing tutorial (by ID)', async () => {
    const nonExistingId = generateObjectId();

    await expect(service.findById(nonExistingId)).rejects.toThrow(NotFoundException);
  });

  it('create a tutorial without a tutor', async () => {
    const dto: TutorialDTO = {
      slot: 'Tutorial 3',
      tutorId: undefined,
      startTime: DateTime.fromISO('09:45:00', { zone: 'utc' }).toISOTime(),
      endTime: DateTime.fromISO('11:15:00', { zone: 'utc' }).toISOTime(),
      dates: createDatesForTutorialAsStrings(),
      correctorIds: [],
    };

    const tutorial = await service.create(dto);

    assertTutorialDTO({ expected: dto, actual: tutorial });
  });

  it('create a tutorial with a tutor', async () => {
    const tutorDoc = getUserDocWithRole(Role.TUTOR);

    const dto: TutorialDTO = {
      slot: 'Tutorial 3',
      tutorId: tutorDoc._id,
      startTime: DateTime.fromISO('09:45:00', { zone: 'utc' }).toJSON(),
      endTime: DateTime.fromISO('11:15:00', { zone: 'utc' }).toJSON(),
      dates: createDatesForTutorialAsStrings(),
      correctorIds: [],
    };

    const tutorial = await service.create(dto);

    assertTutorialDTO({ expected: dto, actual: tutorial });
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

    assertTutorialDTO({ expected: dto, actual: tutorial });
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

    assertTutorialDTO({ expected: dto, actual: tutorial });
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

  it('fail on creating a tutorial with an already existing slot', async () => {
    const tutorial = TUTORIAL_DOCUMENTS[0];
    const dto: TutorialDTO = {
      slot: tutorial.slot,
      tutorId: undefined,
      startTime: DateTime.fromISO('09:45:00', { zone: 'utc' }).toJSON(),
      endTime: DateTime.fromISO('11:15:00', { zone: 'utc' }).toJSON(),
      dates: createDatesForTutorialAsStrings(),
      correctorIds: [],
    };

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });

  it('update a tutorial without updating the tutor of the correctors', async () => {
    const updatedDTO: TutorialDTO = {
      slot: 'Tutorial 3',
      tutorId: undefined,
      startTime: DateTime.fromISO('09:45:00', { zone: 'utc' }).toISOTime(),
      endTime: DateTime.fromISO('11:15:00', { zone: 'utc' }).toISOTime(),
      dates: createDatesForTutorialAsStrings(),
      correctorIds: [],
    };
    const createDTO: TutorialDTO = {
      ...updatedDTO,
      slot: 'Tutorial Prev',
      startTime: DateTime.fromISO('14:00:00', { zone: 'utc' }).toISOTime(),
      endTime: DateTime.fromISO('15:30:00', { zone: 'utc' }).toISOTime(),
      dates: createDatesForTutorialAsStrings('2020-02-18'),
    };

    const oldTutorial = await service.create(createDTO);
    const updatedTutorial = await service.update(oldTutorial.id, updatedDTO);

    assertTutorialDTO({ expected: updatedDTO, actual: updatedTutorial, oldTutorial });
  });

  it('update tutor of tutorial', async () => {
    const tutors = getAllUserDocsWithRole(Role.TUTOR);
    const updatedDTO: TutorialDTO = {
      slot: 'Tutorial 3',
      tutorId: tutors[0]._id,
      startTime: DateTime.fromISO('09:45:00', { zone: 'utc' }).toISOTime(),
      endTime: DateTime.fromISO('11:15:00', { zone: 'utc' }).toISOTime(),
      dates: createDatesForTutorialAsStrings(),
      correctorIds: [],
    };
    const createDTO: TutorialDTO = {
      ...updatedDTO,
      tutorId: tutors[1]._id,
    };

    const oldTutorial = await service.create(createDTO);
    const updatedTutorial = await service.update(oldTutorial.id, updatedDTO);

    assertTutorialDTO({ expected: updatedDTO, actual: updatedTutorial, oldTutorial });
  });

  it('update tutorial to not have a tutor anymore', async () => {
    const tutor = getUserDocWithRole(Role.TUTOR);
    const updatedDTO: TutorialDTO = {
      slot: 'Tutorial 3',
      tutorId: undefined,
      startTime: DateTime.fromISO('09:45:00', { zone: 'utc' }).toISOTime(),
      endTime: DateTime.fromISO('11:15:00', { zone: 'utc' }).toISOTime(),
      dates: createDatesForTutorialAsStrings(),
      correctorIds: [],
    };
    const createDTO: TutorialDTO = {
      ...updatedDTO,
      tutorId: tutor._id,
    };

    const oldTutorial = await service.create(createDTO);
    const updatedTutorial = await service.update(oldTutorial.id, updatedDTO);

    assertTutorialDTO({ expected: updatedDTO, actual: updatedTutorial, oldTutorial });
  });

  it('update correctors of tutorial', async () => {
    const correctors = getAllUserDocsWithRole(Role.CORRECTOR);

    const updatedDTO: TutorialDTO = {
      slot: 'Tutorial 3',
      tutorId: undefined,
      startTime: DateTime.fromISO('09:45:00', { zone: 'utc' }).toISOTime(),
      endTime: DateTime.fromISO('11:15:00', { zone: 'utc' }).toISOTime(),
      dates: createDatesForTutorialAsStrings(),
      correctorIds: [correctors[0]._id],
    };
    const createDTO: TutorialDTO = {
      ...updatedDTO,
      correctorIds: [correctors[1]._id],
    };

    const oldTutorial = await service.create(createDTO);
    const updatedTutorial = await service.update(oldTutorial.id, updatedDTO);

    assertTutorialDTO({ expected: updatedDTO, actual: updatedTutorial, oldTutorial });
  });

  it('fail on updating with a non-existing tutor', async () => {
    const nonExistingId = generateObjectId();
    const updatedDTO: TutorialDTO = {
      slot: 'Tutorial 3',
      tutorId: nonExistingId,
      startTime: DateTime.fromISO('09:45:00', { zone: 'utc' }).toISOTime(),
      endTime: DateTime.fromISO('11:15:00', { zone: 'utc' }).toISOTime(),
      dates: createDatesForTutorialAsStrings(),
      correctorIds: [],
    };
    const createDTO: TutorialDTO = {
      ...updatedDTO,
      tutorId: undefined,
    };

    const oldTutorial = await service.create(createDTO);

    await expect(service.update(oldTutorial.id, updatedDTO)).rejects.toThrow(NotFoundException);
  });

  it('fail on updating with a non-existing corrector', async () => {
    const nonExistingId = generateObjectId();
    const updatedDTO: TutorialDTO = {
      slot: 'Tutorial 3',
      tutorId: undefined,
      startTime: DateTime.fromISO('09:45:00', { zone: 'utc' }).toISOTime(),
      endTime: DateTime.fromISO('11:15:00', { zone: 'utc' }).toISOTime(),
      dates: createDatesForTutorialAsStrings(),
      correctorIds: [nonExistingId],
    };
    const createDTO: TutorialDTO = {
      ...updatedDTO,
      correctorIds: [],
    };

    const oldTutorial = await service.create(createDTO);

    await expect(service.update(oldTutorial.id, updatedDTO)).rejects.toThrow(NotFoundException);
  });

  it('fail on updating a tutorial with a non-tutor', async () => {
    const nonTutor = getUserDocWithRole(Role.ADMIN);
    const updatedDTO: TutorialDTO = {
      slot: 'Tutorial 3',
      tutorId: nonTutor._id,
      startTime: DateTime.fromISO('09:45:00', { zone: 'utc' }).toISOTime(),
      endTime: DateTime.fromISO('11:15:00', { zone: 'utc' }).toISOTime(),
      dates: createDatesForTutorialAsStrings(),
      correctorIds: [],
    };
    const createDTO: TutorialDTO = {
      ...updatedDTO,
      tutorId: undefined,
    };

    const oldTutorial = await service.create(createDTO);

    await expect(service.update(oldTutorial.id, updatedDTO)).rejects.toThrow(BadRequestException);
  });

  it('fail on updating a tutorial with a non-corrector', async () => {
    const nonCorrector = getUserDocWithRole(Role.ADMIN);
    const updatedDTO: TutorialDTO = {
      slot: 'Tutorial 3',
      tutorId: undefined,
      startTime: DateTime.fromISO('09:45:00', { zone: 'utc' }).toISOTime(),
      endTime: DateTime.fromISO('11:15:00', { zone: 'utc' }).toISOTime(),
      dates: createDatesForTutorialAsStrings(),
      correctorIds: [nonCorrector._id],
    };
    const createDTO: TutorialDTO = {
      ...updatedDTO,
      correctorIds: [],
    };

    const oldTutorial = await service.create(createDTO);

    await expect(service.update(oldTutorial.id, updatedDTO)).rejects.toThrow(BadRequestException);
  });

  it('delete a tutorial', async () => {
    const tutorDoc = getUserDocWithRole(Role.TUTOR);

    const dto: TutorialDTO = {
      slot: 'Tutorial 3',
      tutorId: tutorDoc._id,
      startTime: DateTime.fromISO('09:45:00', { zone: 'utc' }).toJSON(),
      endTime: DateTime.fromISO('11:15:00', { zone: 'utc' }).toJSON(),
      dates: createDatesForTutorialAsStrings(),
      correctorIds: [],
    };

    const tutorial = await service.create(dto);
    const deletedTutorial = await service.delete(tutorial.id);

    expect(deletedTutorial.id).toEqual(tutorial.id);
    await expect(service.findById(tutorial.id)).rejects.toThrow(NotFoundException);
  });

  it('fail on deleting a tutorial with students', async () => {
    const tutorialWithStudents = TUTORIAL_DOCUMENTS[0];

    // Sanity check
    expect(tutorialWithStudents.students.length).not.toBe(0);

    await expect(service.delete(tutorialWithStudents._id)).rejects.toThrow(BadRequestException);
  });

  it('get all students of a tutorial', async () => {
    const tutorialWithStudents = TUTORIAL_DOCUMENTS[0];

    // Sanity check
    expect(tutorialWithStudents.students.length).not.toBe(0);

    const students = await service.getAllStudentsOfTutorial(tutorialWithStudents._id);

    expect(students.map(s => s.id)).toEqual(tutorialWithStudents.students.map(s => s._id));
  });

  it('fail on getting all student of a non-existing tutorial', async () => {
    const nonExisting = generateObjectId();

    await expect(service.getAllStudentsOfTutorial(nonExisting)).rejects.toThrow(NotFoundException);
  });
});
