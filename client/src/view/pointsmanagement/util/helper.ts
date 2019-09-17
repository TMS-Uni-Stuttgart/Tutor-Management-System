import { HasId } from 'shared/dist/model/Common';
import { PointId, PointMap } from 'shared/dist/model/Points';
import { Exercise, HasExercises } from 'shared/dist/model/Sheet';

export function getExerciseIdentifier(exercise: Exercise): string {
  return `${exercise.exName}`;
}

export function getExercisePointsIdentifier(
  entityWithExercises: HasId,
  exercise: Exercise
): string {
  return new PointId(entityWithExercises.id, exercise).toString();
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
