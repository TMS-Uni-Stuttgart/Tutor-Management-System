import { HasId } from 'shared/dist/model/Common';
import { PointId, PointMap } from 'shared/dist/model/Points';
import { Exercise, HasExercises } from 'shared/dist/model/Sheet';
import { PointRowFormState } from '../components/TeamPointsRow';

export function getExerciseIdentifier(exercise: Exercise): string {
  return `${exercise.exName}`;
}

export function getExercisePointsIdentifier(
  entityWithExercises: HasId,
  exercise: Exercise
): string {
  return new PointId(entityWithExercises.id, exercise).toString();
}

// TODO: Adjust me to use subexercises and the correct identifier on the state.
export function getInitialValues(
  points: PointMap,
  { id, exercises }: HasExercises
): PointRowFormState {
  const state: PointRowFormState = {};

  for (const exercise of exercises) {
    const pointId = new PointId(id, exercise);
    const pts = points.getPoints(pointId) || 0;

    state[getExerciseIdentifier(exercise)] = pts;
  }

  return state;
}

export function getPointsOfStudentOfExercise(
  studentPoints: PointMap,
  exercise: Exercise,
  { id }: HasId
): number {
  return studentPoints.getPoints(new PointId(id, exercise)) || 0;
}

export function getPointsOfEntityAsString(sheet: HasExercises): string {
  const { must, bonus } = sheet.exercises.reduce(
    ({ must, bonus }, ex) =>
      ex.bonus ? { must, bonus: bonus + ex.maxPoints } : { bonus, must: must + ex.maxPoints },
    { must: 0, bonus: 0 }
  );

  return bonus > 0 ? `${must} + ${bonus}` : `${must}`;
}
