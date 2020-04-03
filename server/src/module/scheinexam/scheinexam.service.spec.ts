import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { assertExercise, assertExerciseDTOs } from '../../../test/helpers/test.assertExercises';
import { generateObjectId } from '../../../test/helpers/test.helpers';
import { TestModule } from '../../../test/helpers/test.module';
import { MockedScheinexamModel, SCHEINEXAM_DOCUMENTS } from '../../../test/mocks/documents.mock';
import { IScheinExam } from '../../shared/model/Scheinexam';
import { ScheinexamDTO } from './scheinexam.dto';
import { ScheinexamService } from './scheinexam.service';

interface AssertScheinexamParams {
  expected: MockedScheinexamModel;
  actual: IScheinExam;
}

interface AssertScheinexamListParams {
  expected: MockedScheinexamModel[];
  actual: IScheinExam[];
}

interface AssertScheinexamDTOParams {
  expected: ScheinexamDTO;
  actual: IScheinExam;
}

/**
 * Checks if the actual Scheinexam matches the expected one.
 *
 * Equality is defined as:
 * - `actual.id` is equal to `expected._id`.
 * - The exercise arrays match as defined by {@link assertExercise}
 * - All other properties match.
 *
 * @param params Must contain an actual and an expected Scheinexam.
 */
function assertScheinexam({ expected, actual }: AssertScheinexamParams) {
  const { _id, exercises, date, totalPoints, ...restExpected } = expected;
  const { exercises: actualExercises, date: actualDate, id, ...restActual } = actual;

  expect(id).toEqual(_id);
  expect(restActual).toEqual(restExpected);
  expect(actualDate).toEqual(date.toISODate());

  expect(actualExercises.length).toEqual(exercises.length);

  for (let i = 0; i < actualExercises.length; i++) {
    assertExercise({ expected: exercises[i], actual: actualExercises[i] });
  }
}

/**
 * Checks if the actual list of scheinexams matches the expected one.
 *
 * Equality is defined as:
 * - All elements in the arrays must be equal as defined by {@link assertScheinexam}.
 *
 * @param params Must contain a list of actual Scheinexam and expected ScheinexamDocuments.
 */
function assertScheinexamList({ expected, actual }: AssertScheinexamListParams) {
  expect(actual.length).toEqual(expected.length);

  for (let i = 0; i < actual.length; i++) {
    assertScheinexam({ expected: expected[i], actual: actual[i] });
  }
}

/**
 * Checks if the actual scheinexam matches the expected DTO.
 *
 * Equality is defined by:
 * - `actual.id` is defined.
 * - `actual.exercises` match `expected.exercise`.
 * - All other properties are equal.
 *
 * @param params Must contain an actual Scheinexam and the expected ScheinexamDTO.
 */
function assertScheinexamDTO({ expected, actual }: AssertScheinexamDTOParams) {
  const { exercises, ...restExpected } = expected;
  const { id, exercises: actualExercises, ...restActual } = actual;

  expect(id).toBeDefined();
  expect(restActual).toEqual(restExpected);

  assertExerciseDTOs({ expected: exercises, actual: actualExercises });
}

describe('ScheinexamService', () => {
  let testModule: TestingModule;
  let service: ScheinexamService;

  beforeAll(async () => {
    testModule = await Test.createTestingModule({
      imports: [TestModule.forRootAsync()],
      providers: [ScheinexamService],
    }).compile();
  });

  afterAll(async () => {
    await testModule.close();
  });

  beforeEach(async () => {
    await testModule.get<TestModule>(TestModule).reset();

    service = testModule.get<ScheinexamService>(ScheinexamService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('find all scheinexam', async () => {
    const scheinexams = await service.findAll();

    assertScheinexamList({
      expected: SCHEINEXAM_DOCUMENTS,
      actual: scheinexams.map((exam) => exam.toDTO()),
    });
  });

  it('find scheinexam by ID', async () => {
    const expected = SCHEINEXAM_DOCUMENTS[0];
    const scheinexam = await service.findById(expected._id);

    assertScheinexam({ expected, actual: scheinexam.toDTO() });
  });

  it('fail on finding a non-existing scheinexam', async () => {
    const nonExisting = generateObjectId();

    await expect(service.findById(nonExisting)).rejects.toThrow(NotFoundException);
  });

  it('create a new scheinexam', async () => {
    const dto = getDTO();
    const created = await service.create(dto);

    assertScheinexamDTO({ expected: dto, actual: created });
  });

  it('update basic information of a scheinexam', async () => {
    const updateDTO = getDTO();
    const createDTO: ScheinexamDTO = {
      ...updateDTO,
      scheinExamNo: 2,
      percentageNeeded: 0.7,
      date: '2020-02-01',
    };

    const oldScheinexam = await service.create(createDTO);
    const updated = await service.update(oldScheinexam.id, updateDTO);

    assertScheinexamDTO({ expected: updateDTO, actual: updated });
  });

  it('update exercises of a scheinexam', async () => {
    const updateDTO = getDTO();
    const createDTO: ScheinexamDTO = {
      ...updateDTO,
      exercises: [
        {
          exName: '7',
          maxPoints: 13.37,
          bonus: false,
        },
      ],
    };

    const oldScheinexam = await service.create(createDTO);
    const updated = await service.update(oldScheinexam.id, updateDTO);

    assertScheinexamDTO({ expected: updateDTO, actual: updated });
  });

  it('update subexercise of a scheinexam', async () => {
    const updateDTO: ScheinexamDTO = {
      ...getDTO(),
      exercises: [
        {
          exName: '7',
          maxPoints: 13.37,
          bonus: false,
          subexercises: [
            {
              id: '5e559160ed91238f8762e8aa',
              exName: '(b)',
              bonus: false,
              maxPoints: 15,
            },
          ],
        },
      ],
    };
    const createDTO: ScheinexamDTO = {
      ...updateDTO,
      exercises: [
        {
          exName: '7',
          maxPoints: 13.37,
          bonus: false,
          subexercises: [
            {
              id: '5e559160ed91238f8762e8aa',
              exName: '(a)',
              bonus: false,
              maxPoints: 10,
            },
          ],
        },
      ],
    };

    const oldScheinexam = await service.create(createDTO);
    const updated = await service.update(oldScheinexam.id, updateDTO);

    assertScheinexamDTO({ expected: updateDTO, actual: updated });
  });

  it('fail on updating a non-existing scheinexam', async () => {
    const nonExisting = generateObjectId();
    const dto = getDTO();

    await expect(service.update(nonExisting, dto)).rejects.toThrow(NotFoundException);
  });

  it('delete a scheinexam', async () => {
    const dto = getDTO();

    const scheinexam = await service.create(dto);
    const deletedScheinexam = await service.delete(scheinexam.id);

    expect(deletedScheinexam.id).toEqual(scheinexam.id);
    await expect(service.findById(scheinexam.id)).rejects.toThrow(NotFoundException);
  });

  it('fail on deleting a non-existing scheinexam', async () => {
    const nonExisting = generateObjectId();

    await expect(service.delete(nonExisting)).rejects.toThrow(NotFoundException);
  });
});

/**
 * Helper functions just returning a ScheinexamDTO so the test functions don't get blown up.
 *
 * @returns ScheinexamDTO to use.
 */
function getDTO(): ScheinexamDTO {
  return {
    scheinExamNo: 17,
    percentageNeeded: 0.5,
    date: '2020-02-26',
    exercises: [
      {
        exName: '1',
        maxPoints: 0,
        bonus: false,
        subexercises: [
          {
            exName: 'a',
            maxPoints: 13.37,
            bonus: false,
          },
          {
            exName: 'b',
            maxPoints: 42,
            bonus: false,
          },
        ],
      },
      {
        exName: '2',
        maxPoints: 13.37,
        bonus: false,
      },
      {
        exName: '4',
        maxPoints: 42,
        bonus: true,
      },
    ],
  };
}
