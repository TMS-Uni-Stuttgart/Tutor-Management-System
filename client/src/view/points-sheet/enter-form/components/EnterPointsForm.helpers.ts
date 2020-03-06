import { Exercise, HasExercises } from '../../../../model/Exercise';
import { Grading } from '../../../../model/Grading';
import { FormikSubmitCallback } from '../../../../types';
import { HasGradings } from '../../../../typings/types';

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
  entity: HasGradings;
  sheet: HasExercises;
}

interface GeneratePointsSubexerciseParams {
  exercise: Exercise;
  gradingOfTeam: Grading;
}

export function generatePointStateWithSubexercises({
  exercise,
  gradingOfTeam: pointsOfTeam,
}: GeneratePointsSubexerciseParams): PointsFormSubExerciseState {
  const grading = pointsOfTeam.getExerciseGrading(exercise);
  const { subexercises } = exercise;

  return subexercises.reduce<PointsFormSubExerciseState>((prev, current) => {
    const gradingOfSubEx = grading?.getGradingForSubexercise(current);

    return { ...prev, [current.id]: gradingOfSubEx?.toString() ?? '0' };
  }, {});
}

export function generateInitialValues({ entity, sheet }: InitialValuesOptions): PointsFormState {
  const gradingOfTeam = entity.getGrading(sheet);
  const exercises: { [id: string]: PointsFormExerciseState } = {};

  if (!gradingOfTeam) {
    return { comment: '', additionalPoints: '0', exercises };
  }

  sheet.exercises.forEach(exercise => {
    if (exercise.subexercises.length > 0) {
      const points: PointsFormSubExerciseState = generatePointStateWithSubexercises({
        exercise,
        gradingOfTeam,
      });

      exercises[exercise.id] = {
        comment: gradingOfTeam.comment ?? '',
        points,
      };
    } else {
      exercises[exercise.id] = {
        comment: gradingOfTeam.comment ?? '',
        points: gradingOfTeam.totalPoints.toString() ?? '0',
      };
    }
  });

  return {
    comment: '',
    additionalPoints: '0',
    exercises,
  };
}
