import { HasId } from 'shared/dist/model/Common';
import { Exercise, HasExercises, PointId } from 'shared/dist/model/Sheet';
import { Student } from 'shared/dist/model/Student';
import { PointRowFormState } from '../components/TeamPointsRow';

export type PointsMap = Student['points'];

export function getExerciseIdentifier(exercise: Exercise): string {
  return `${exercise.exName}`;
}

export function getExercisePointsIdentifier(
  entityWithExercises: HasId,
  exercise: Exercise
): string {
  return new PointId(entityWithExercises.id, exercise).toString();
}

export function getInitialValues(
  points: PointsMap,
  entityWithExercises: HasExercises
): PointRowFormState {
  const state: PointRowFormState = {};

  for (const exercise of entityWithExercises.exercises) {
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
