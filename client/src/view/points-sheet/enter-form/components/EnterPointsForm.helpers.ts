import { PointId, PointMap, PointMapEntry, PointsOfSubexercises } from 'shared/model/Points';
import { IExercise, ISheet } from 'shared/model/Sheet';
import { FormikSubmitCallback } from '../../../../types';
import { HasPoints } from '../../../../typings/types';

export interface PointsFormSubExerciseState {
  [subExerciseId: string]: string;
}

export interface PointsFormExerciseState {
  comment: string;
  points: string | PointsFormSubExerciseState;
}

export interface PointsFormState {
  comment: string;
  additionalPoints: string;
  exercises: {
    [exerciseId: string]: PointsFormExerciseState;
  };
}

export type PointsFormSubmitCallback = FormikSubmitCallback<PointsFormState>;

interface InitialValuesOptions {
  entity: HasPoints;
  sheet: ISheet;
}

interface GeneratePointsSubexerciseParams {
  exercise: IExercise;
  pointsOfTeam: PointMapEntry;
}

export function getDefaultPointMapEntry(exercise: IExercise): PointMapEntry {
  if (exercise.subexercises.length > 0) {
    const points: PointsOfSubexercises = {};

    exercise.subexercises.forEach(subEx => {
      points[subEx.id] = 0;
    });

    return {
      comment: '',
      points,
    };
  } else {
    return {
      comment: '',
      points: 0,
    };
  }
}

export function generatePointStateWithSubexercises({
  exercise,
  pointsOfTeam,
}: GeneratePointsSubexerciseParams): PointsFormSubExerciseState {
  const { subexercises } = exercise;

  return subexercises.reduce<PointsFormSubExerciseState>((prev, current) => {
    if (typeof pointsOfTeam.points === 'number') {
      return prev;
    }

    const pointsOfSubEx = pointsOfTeam.points[current.id];

    return { ...prev, [current.id]: pointsOfSubEx?.toString() ?? '0' };
  }, {});
}

export function generateInitialValues({ entity, sheet }: InitialValuesOptions): PointsFormState {
  const pointMap = new PointMap(entity.points);
  const exercises: { [id: string]: PointsFormExerciseState } = {};

  sheet.exercises.forEach(exercise => {
    const pointsOfTeam =
      pointMap.getPointEntry(new PointId(sheet.id, exercise.id)) ??
      getDefaultPointMapEntry(exercise);

    if (exercise.subexercises.length > 0) {
      const points: PointsFormSubExerciseState = generatePointStateWithSubexercises({
        exercise,
        pointsOfTeam,
      });

      exercises[exercise.id] = {
        comment: pointsOfTeam.comment ?? '',
        points,
      };
    } else {
      exercises[exercise.id] = {
        comment: pointsOfTeam.comment ?? '',
        points: pointsOfTeam.points.toString() ?? '0',
      };
    }
  });

  return {
    comment: '',
    additionalPoints: '0',
    exercises,
  };
}
