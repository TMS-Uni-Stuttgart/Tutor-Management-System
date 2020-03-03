import { ExerciseDTO, SubExerciseDTO } from '../../src/module/sheet/sheet.dto';
import { Exercise, Subexercise } from '../../src/shared/model/Sheet';
import { MockedExerciseModel, MockedSubExerciseModel } from '../mocks/documents.mock';

interface AssertSubExerciseParams {
  expected: MockedSubExerciseModel;
  actual: Subexercise;
}

interface AssertExerciseParams {
  expected: MockedExerciseModel;
  actual: Exercise;
}

interface AssertExerciseDTOsParams {
  expected: ExerciseDTO[];
  actual: Exercise[];
}

interface AssertSubExerciseDTOParams {
  expected: SubExerciseDTO[];
  actual: Subexercise[];
}

/**
 * Checks if the actual SubExercise matches the expected ones.
 *
 * They are considered equal if all their properties match and if `actual.id` matches `expected._id`.
 *
 * @param params Must contain an expected SubExercise and an actual SubExercise.
 */
function assertSubExercise({ expected, actual }: AssertSubExerciseParams) {
  const { _id, pointInfo, ...restExpected } = expected;
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
export function assertExercise({ expected, actual }: AssertExerciseParams) {
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
 * Checks if the actual exercises match their DTO representation.
 *
 * @param params Must contain a list of expected DTOs and a list with the actual exercises.
 */
export function assertExerciseDTOs({ expected, actual }: AssertExerciseDTOsParams) {
  expect(actual.length).toEqual(expected.length);

  for (let i = 0; i < expected.length; i++) {
    const { id, subexercises, maxPoints, ...restExpected } = expected[i];
    const {
      id: actualId,
      subexercises: actualSubexercises,
      maxPoints: actualMaxPoints,
      ...restActual
    } = actual[i];

    if (!!id) {
      expect(actualId).toEqual(id);
    } else {
      expect(actualId).toBeDefined();
    }

    expect(restActual).toEqual(restExpected);

    if (!!subexercises) {
      const expectedMaxPoints = subexercises.reduce((sum, cur) => sum + cur.maxPoints, 0);

      expect(actualMaxPoints).toEqual(expectedMaxPoints);
      assertSubExerciseDTOs({ expected: subexercises, actual: actualSubexercises });
    } else {
      expect(actualMaxPoints).toEqual(maxPoints);
      expect(actualSubexercises).toHaveLength(0);
    }
  }
}

/**
 * Checks if the actual subexercises match their DTO representations.
 *
 * @param params Must contain a list of the expected SubExerciseDTOs and the actual SubExercises.
 */
function assertSubExerciseDTOs({ expected, actual }: AssertSubExerciseDTOParams) {
  expect(actual.length).toEqual(expected.length);

  for (let k = 0; k < expected.length; k++) {
    const { id, ...restExpected } = expected[k];
    const { id: actualId, ...restActual } = actual[k];

    expect(restActual).toEqual(restExpected);

    if (!!id) {
      expect(actualId).toEqual(id);
    } else {
      expect(actualId).toBeDefined();
    }
  }
}
