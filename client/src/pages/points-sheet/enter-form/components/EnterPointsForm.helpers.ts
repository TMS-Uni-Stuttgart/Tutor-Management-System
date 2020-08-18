import { Exercise, HasExercises } from '../../../../model/Exercise';
import { ExerciseGrading } from '../../../../model/Grading';
import { FormikSubmitCallback } from '../../../../types';
import { HasGradings } from '../../../../typings/types';

interface PointsFormSubExerciseState {
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
  gradingOfExercise: ExerciseGrading | undefined;
}

function generatePointStateWithSubexercises({
  exercise,
  gradingOfExercise,
}: GeneratePointsSubexerciseParams): PointsFormSubExerciseState {
  const { subexercises } = exercise;

  return subexercises.reduce<PointsFormSubExerciseState>((prev, current) => {
    const gradingOfSubEx: number | undefined = gradingOfExercise?.getGradingForSubexercise(current);

    return {
      ...prev,
      [current.id]: gradingOfSubEx?.toString() ?? '0',
    } as PointsFormSubExerciseState;
  }, {});
}

export function generateInitialValues({ entity, sheet }: InitialValuesOptions): PointsFormState {
  const gradingOfTeam = entity.getGrading(sheet);
  const exercises: { [id: string]: PointsFormExerciseState } = {};

  sheet.exercises.forEach((exercise) => {
    const gradingOfExercise = gradingOfTeam?.getExerciseGrading(exercise);

    if (exercise.subexercises.length > 0) {
      const points: PointsFormSubExerciseState = generatePointStateWithSubexercises({
        exercise,
        gradingOfExercise,
      });

      exercises[exercise.id] = {
        comment: gradingOfExercise?.comment ?? '',
        points,
      };
    } else {
      exercises[exercise.id] = {
        comment: gradingOfExercise?.comment ?? '',
        points: gradingOfExercise?.totalPoints.toString() ?? '0',
      };
    }
  });

  return {
    comment: gradingOfTeam?.comment ?? '',
    additionalPoints: gradingOfTeam?.additionalPoints?.toString() ?? '0',
    exercises,
  };
}
