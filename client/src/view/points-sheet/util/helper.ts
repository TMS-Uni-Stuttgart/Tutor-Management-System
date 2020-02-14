import { HasExercises } from 'shared/model/Sheet';
import { ExerciseFormExercise } from '../../../components/forms/components/FormikExerciseEditor';

export function getPointsOfEntityAsString(sheet: HasExercises): string {
  const { must, bonus } = sheet.exercises.reduce(
    ({ must, bonus }, ex) =>
      ex.bonus ? { must, bonus: bonus + ex.maxPoints } : { bonus, must: must + ex.maxPoints },
    { must: 0, bonus: 0 }
  );

  return bonus > 0 ? `${must} + ${bonus}` : `${must}`;
}

export function getDuplicateExerciseName(exercises: ExerciseFormExercise[]): string | undefined {
  for (const exercise of exercises) {
    const ex = exercises.find(t => t !== exercise && t.exName === exercise.exName);

    if (ex !== undefined) {
      return ex.exName;
    }
  }

  return undefined;
}
