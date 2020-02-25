import { Test, TestingModule } from '@nestjs/testing';
import { SheetService } from './sheet.service';
import { TestModule } from '../../../test/helpers/test.module';
import {
  SHEET_DOCUMENTS,
  MockedSheetModel,
  MockedExerciseModel,
  MockedSubExerciseModel,
} from '../../../test/mocks/documents.mock';
import { Sheet, Exercise, Subexercise } from '../../shared/model/Sheet';
import { SheetDTO } from './sheet.dto';
import { generateObjectId } from '../../../test/helpers/test.helpers';
import { NotFoundException } from '@nestjs/common';

interface AssertSubExerciseParams {
  expected: MockedSubExerciseModel;
  actual: Subexercise;
}

interface AssertExerciseParams {
  expected: MockedExerciseModel;
  actual: Exercise;
}

interface AssertSheetParams {
  expected: MockedSheetModel;
  actual: Sheet;
}

interface AssertSheetListParams {
  expected: MockedSheetModel[];
  actual: Sheet[];
}

interface AssertSheetDTOParams {
  expected: SheetDTO;
  actual: Sheet;
}

/**
 * Checks if the actual SubExercise matches the expected ones.
 *
 * They are considered equal if all their properties match and if `actual.id` matches `expected._id`.
 *
 * @param params Must contain an expected SubExercise and an actual SubExercise.
 */
function assertSubExercise({ expected, actual }: AssertSubExerciseParams) {
  const { _id, ...restExpected } = expected;
  const { id, ...restActual } = actual;

  expect(id).toEqual(_id);
  expect(restActual).toEqual(restExpected);
}

/**
 * Checks if the actual exercise matches the expected one.
 *
 * Equality is defined as:
 * - The actual `subexercises` array matches the expected one (if it exists) as defined by {@link assertSubExercise}. If the expected exercise does __not__ have such an array, the actual array needs to be empty.
 * - All other properties match.
 *
 * @param params Must contain an expected ExerciseDocument and an actual Exercise.
 */
function assertExercise({ expected, actual }: AssertExerciseParams) {
  const { subexercises, ...restExpected } = expected;
  const { subexercises: actualSubexercises, ...restActual } = actual;

  assertSubExercise({ expected: restExpected, actual: restActual });

  if (!subexercises) {
    expect(actualSubexercises).toHaveLength(0);
  } else {
    expect(actualSubexercises.length).toEqual(subexercises.length);
    for (let i = 0; i < subexercises.length; i++) {
      assertSubExercise({
        expected: subexercises[i],
        actual: actualSubexercises[i],
      });
    }
  }
}

/**
 * Checks if the actual Sheet matches the expected one.
 *
 * Equality is defined as:
 * - `actual.id` is equal to `expected._id`.
 * - The exercise arrays match as defined by {@link assertExercise}
 * - All other properties match.
 *
 * @param params Must contain an actual and an expected Sheet.
 */
function assertSheet({ expected, actual }: AssertSheetParams) {
  const { _id, exercises, ...restExpected } = expected;
  const { exercises: actualExercises, id, ...restActual } = actual;

  expect(id).toEqual(_id);
  expect(restActual).toEqual(restExpected);

  expect(actualExercises.length).toEqual(exercises.length);

  for (let i = 0; i < actualExercises.length; i++) {
    assertExercise({ expected: exercises[i], actual: actualExercises[i] });
  }
}

/**
 * Checks if the actual list of sheets matches the expected one.
 *
 * Equality is defined as:
 * - All elements in the arrays must be equal as defined by {@link assertSheet}.
 *
 * @param params Must contain a list of actual Sheets and expected SheetDocuments.
 */
function assertSheetList({ expected, actual }: AssertSheetListParams) {
  expect(actual.length).toEqual(expected.length);

  for (let i = 0; i < actual.length; i++) {
    assertSheet({ expected: expected[i], actual: actual[i] });
  }
}

/**
 * Checks if the actual sheet matches the expected DTO.
 *
 * Equality is defined by:
 * - `actual.id` is defined.
 * - `actual.exercises` match `expected.exercise`.
 * - All other properties are equal.
 *
 * @param params Must contain an actual Sheet and the expected SheetDTO.
 */
function assertSheetDTO({ expected, actual }: AssertSheetDTOParams) {
  const { exercises, ...restExpected } = expected;
  const { id, exercises: actualExercises, ...restActual } = actual;

  expect(id).toBeDefined();
  expect(restActual).toEqual(restExpected);

  expect(actualExercises.length).toEqual(exercises.length);

  // TODO: Clean me up!
  for (let i = 0; i < exercises.length; i++) {
    const { id, subexercises, maxPoints, ...restExpected } = exercises[i];
    const {
      id: actualId,
      subexercises: actualSubexercises,
      maxPoints: actualMaxPoints,
      ...restActual
    } = actualExercises[i];

    if (!!id) {
      expect(actualId).toEqual(id);
    } else {
      expect(actualId).toBeDefined();
    }

    expect(restActual).toEqual(restExpected);

    if (!!subexercises) {
      const expectedMaxPoints = subexercises.reduce((sum, cur) => sum + cur.maxPoints, 0);

      expect(actualMaxPoints).toEqual(expectedMaxPoints);
      expect(actualSubexercises.length).toEqual(subexercises.length);

      for (let k = 0; k < subexercises.length; k++) {
        const { id, ...restExp } = subexercises[k];
        const { id: actualId, ...restAct } = actualSubexercises[k];

        expect(restAct).toEqual(restExp);

        if (!!id) {
          expect(actualId).toEqual(id);
        } else {
          expect(actualId).toBeDefined();
        }
      }
    } else {
      expect(actualMaxPoints).toEqual(maxPoints);
      expect(actualSubexercises).toHaveLength(0);
    }
  }
}

describe('SheetService', () => {
  let testModule: TestingModule;
  let service: SheetService;

  beforeAll(async () => {
    testModule = await Test.createTestingModule({
      imports: [TestModule.forRootAsync()],
      providers: [SheetService],
    }).compile();
  });

  afterAll(async () => {
    await testModule.close();
  });

  beforeEach(async () => {
    await testModule.get<TestModule>(TestModule).reset();

    service = testModule.get<SheetService>(SheetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('find all sheets', async () => {
    const sheets = await service.findAll();

    assertSheetList({ expected: SHEET_DOCUMENTS, actual: sheets });
  });

  it('find sheet by ID', async () => {
    const expected = SHEET_DOCUMENTS[0];
    const sheet = await service.findById(expected._id);

    assertSheet({ expected, actual: sheet.toDTO() });
  });

  it('fail on finding a non-existing sheet', async () => {
    const nonExisting = generateObjectId();

    await expect(service.findById(nonExisting)).rejects.toThrow(NotFoundException);
  });

  it('create a new sheet', async () => {
    const dto = getDTO();
    const created = await service.create(dto);

    assertSheetDTO({ expected: dto, actual: created });
  });
});

/**
 * Helper functions just returning a SheetDTO so the test functions don't get blown up.
 *
 * @returns SheetDTO to use.
 */
function getDTO(): SheetDTO {
  return {
    sheetNo: 17,
    bonusSheet: false,
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
