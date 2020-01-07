import { PointsFormExerciseState, PointsFormState } from './components/EnterPointsForm.helpers';
import {
  PointMapEntry,
  PointsOfSubexercises,
  PointMap,
  SheetMapEntry,
  ExercisePointInfo,
} from 'shared/dist/model/Points';

/**
 * Converts the given form state of __one__ exercise to a valid PointMapEntry.
 *
 * @param state State representing exactly one exercise.
 */
function convertFormExerciseStateToPointMapEntry({
  comment,
  points,
}: PointsFormExerciseState): PointMapEntry {
  if (typeof points === 'string') {
    return {
      comment,
      points: points ? Number.parseFloat(points) : 0,
    };
  } else {
    const pointsOfSubexercises: PointsOfSubexercises = {};

    Object.entries(points).forEach(([subKey, value]) => {
      pointsOfSubexercises[subKey] = value ? Number.parseFloat(value) : 0;
    });

    return {
      comment,
      points: pointsOfSubexercises,
    };
  }
}

interface ConvertParams {
  values: PointsFormState;
  sheetId: string;
}

/**
 * Converts the given PointsFormState to a PointMap with exactly one entry.
 *
 * This entry is the one from the given values with the given `sheetId` as key.
 *
 * @param values Form values of the point form.
 * @param sheetId ID of the sheet to which the values belong to.
 */
export function convertFormStateToPointMap({ values, sheetId }: ConvertParams): PointMap {
  const points = new PointMap();
  const entry: SheetMapEntry = {
    comment: values.comment,
    additionalPoints: values.additionalPoints ? Number.parseFloat(values.additionalPoints) : 0,
    exercises: {},
  };

  Object.entries(values.exercises).forEach(([exerciseId, state]) => {
    entry.exercises[exerciseId] = convertFormExerciseStateToPointMapEntry(state);
  });

  points.setSheetEntry(sheetId, entry);

  return points;
}

interface ConvertedPoints {
  achieved: number;
  total: ExercisePointInfo;
}

export function getPointsFromState(values: PointsFormState): number {
  return Object.values(values.exercises).reduce((sum, { points }) => {
    if (typeof points === 'string') {
      return sum + Number.parseFloat(points);
    }

    return Object.values(points).reduce((pts, value) => {
      return pts + Number.parseFloat(value);
    }, sum);
  }, Number.parseFloat(values.additionalPoints));
}
