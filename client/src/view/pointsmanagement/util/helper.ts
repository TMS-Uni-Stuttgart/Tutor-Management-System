import { PointRowFormState } from '../components/TeamPointsRow';
import { HasExercises } from '../../../typings/types';
import { HasId, Exercise, Student } from '../../../typings/ServerResponses';

export type PointsMap = Student['points'];

export function getExerciseIdentifier(exercise: Exercise): string {
  return `${exercise.exNo}`;
}

export function getExercisePointsIdentifier(
  entityWithExercises: HasId,
  exercise: Exercise
): string {
  return `ID::${entityWithExercises.id}--Ex::${exercise.exNo}`;
}

export function getInitialValues(
  points: PointsMap,
  entityWithExercises: HasExercises
): PointRowFormState {
  const state: PointRowFormState = {};

  for (let exercise of entityWithExercises.exercises) {
    const pts = points[getExercisePointsIdentifier(entityWithExercises, exercise)] || 0;
    state[getExerciseIdentifier(exercise)] = pts;
  }

  return state;
}

export function getPointsOfStudentOfExercise(
  studentPoints: PointsMap,
  exercise: Exercise,
  entityWithExercise: HasId
): number {
  return studentPoints[getExercisePointsIdentifier(entityWithExercise, exercise)] || 0;
}

export function getPointsOfStudentOfSheet(
  studentPoints: PointsMap,
  entityWithExercises: HasExercises
): number {
  const { exercises } = entityWithExercises;

  return exercises.reduce(
    (prev, ex) => prev + (studentPoints[getExercisePointsIdentifier(entityWithExercises, ex)] || 0),
    0
  );
}

export function getPointsOfEntityAsString(sheet: HasExercises): string {
  const { must, bonus } = sheet.exercises.reduce(
    ({ must, bonus }, ex) =>
      ex.bonus ? { must, bonus: bonus + ex.maxPoints } : { bonus, must: must + ex.maxPoints },
    { must: 0, bonus: 0 }
  );

  return bonus > 0 ? `${must} + ${bonus}` : `${must}`;
}
