import { FormikSubmitCallback } from '../../../../types';
import { Student } from 'shared/model/Student';
import { ScheinExam } from 'shared/model/Scheinexam';
import { PointMap, PointId, SheetMapEntry } from 'shared/model/Points';

export interface ScheinexamPointsFormState {
  [exerciseId: string]: {
    points: string;
  };
}

export type ScheinexamPointsFormSubmitCallback = FormikSubmitCallback<ScheinexamPointsFormState>;

interface GenerateInitialValuesParams {
  student: Student;
  exam: ScheinExam;
}

interface ConvertParams {
  values: ScheinexamPointsFormState;
  examId: string;
}

export function generateInitialValues({
  student,
  exam,
}: GenerateInitialValuesParams): ScheinexamPointsFormState {
  const pointMap = new PointMap(student.scheinExamResults);
  const state: ScheinexamPointsFormState = {};

  exam.exercises.forEach(exercise => {
    const pointsOfStudent: number = pointMap.getPoints(new PointId(exam.id, exercise.id)) ?? 0;

    state[exercise.id] = { points: pointsOfStudent.toString() };
  });

  return state;
}

export function convertFormStateToPointMap({ values, examId }: ConvertParams): PointMap {
  const points = new PointMap();
  const entry: SheetMapEntry = {
    comment: '',
    additionalPoints: 0,
    exercises: {},
  };

  Object.entries(values).forEach(([exerciseId, state]) => {
    const points = Number.parseFloat(state.points);

    entry.exercises[exerciseId] = {
      points: Number.isNaN(points) ? 0 : points,
      comment: '',
    };
  });

  points.setSheetEntry(examId, entry);

  return points;
}

export function getPointsFromState(values: ScheinexamPointsFormState): number {
  return Object.values(values).reduce((sum, { points }) => {
    const achieved = Number.parseFloat(points);

    if (Number.isNaN(achieved)) {
      return sum;
    } else {
      return sum + achieved;
    }
  }, 0);
}
