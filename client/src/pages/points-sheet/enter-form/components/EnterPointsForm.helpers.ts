import { SheetState } from 'shared/model/Gradings';
import { Exercise, HasExercises } from '../../../../model/Exercise';
import { ExerciseGrading, Grading } from '../../../../model/Grading';
import { FormikSubmitCallback } from '../../../../types';

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
    sheetState?: SheetState;
}

export type PointsFormSubmitCallback = FormikSubmitCallback<PointsFormState>;

interface InitialValuesOptions {
    grading: Grading | undefined;
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
        const gradingOfSubEx: number | undefined =
            gradingOfExercise?.getGradingForSubexercise(current);

        return {
            ...prev,
            [current.id]: gradingOfSubEx?.toString() ?? '0',
        } as PointsFormSubExerciseState;
    }, {});
}

export function generateInitialValues({ sheet, grading }: InitialValuesOptions): PointsFormState {
    const exercises: { [id: string]: PointsFormExerciseState } = {};

    sheet.exercises.forEach((exercise) => {
        const gradingOfExercise = grading?.getExerciseGrading(exercise);

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
        comment: grading?.comment ?? '',
        additionalPoints: grading?.additionalPoints?.toString() ?? '0',
        exercises,
        sheetState: grading?.sheetState ? (grading.sheetState ?? SheetState.NO_STATE) : undefined,
    };
}
