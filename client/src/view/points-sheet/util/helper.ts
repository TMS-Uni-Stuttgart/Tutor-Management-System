import { ExerciseFormExercise } from '../../../components/forms/components/FormikExerciseEditor';

export function getDuplicateExerciseName(exercises: ExerciseFormExercise[]): string | undefined {
  for (const exercise of exercises) {
    const ex = exercises.find((t) => t !== exercise && t.exName === exercise.exName);

    if (ex !== undefined) {
      return ex.exName;
    }
  }

  return undefined;
}
