import { HasExercises, IExercise } from './Sheet';

export interface IExerciseGrading {
  points: number;
  comment?: string;
  additionalPoints?: number;
  subExercisePoints?: [string, number][];
}

export interface IGrading {
  id: string;
  exerciseGradings: [string, IExerciseGrading][];
  belongsToTeam: boolean;
  points: number;
  comment?: string;
  additionalPoints?: number;
}

export interface IExerciseGradingDTO {
  comment?: string;
  additionalPoints?: number;
  points?: number;
  subExercisePoints?: [string, number][];
}

export interface IGradingDTO {
  exerciseGradings: [string, IExerciseGradingDTO][];
  belongsToTeam: boolean;
  sheetId?: string;
  examId?: string;
  gradingId?: string;
  comment?: string;
  additionalPoints?: number;
}

export interface IPresentationPointsDTO {
  sheetId: string;
  points: number;
}

export type ExercisePointInfo = { must: number; bonus: number };

export function convertExercisePointInfoToString(exPointInfo: ExercisePointInfo): string {
  if (exPointInfo.must > 0 && exPointInfo.bonus > 0) {
    return `${exPointInfo.must} + ${exPointInfo.bonus}`;
  } else if (exPointInfo.bonus === 0) {
    return `${exPointInfo.must}`;
  } else {
    return `${exPointInfo.bonus} Bonus`;
  }
}

export function getPointsOfExercise(exercise: IExercise): ExercisePointInfo {
  const points: ExercisePointInfo = { must: 0, bonus: 0 };

  if (exercise.subexercises.length === 0) {
    if (exercise.bonus) {
      return { must: 0, bonus: exercise.maxPoints };
    } else {
      return { must: exercise.maxPoints, bonus: 0 };
    }
  }

  return exercise.subexercises.reduce((pts, subEx) => {
    if (subEx.bonus) {
      return { ...pts, bonus: pts.bonus + subEx.maxPoints };
    } else {
      return { ...pts, must: pts.must + subEx.maxPoints };
    }
  }, points);
}

export function getPointsOfAllExercises({ exercises }: HasExercises): ExercisePointInfo {
  return exercises.reduce(
    (pts, ex) => {
      const { must, bonus } = getPointsOfExercise(ex);

      return { must: pts.must + must, bonus: pts.bonus + bonus };
    },
    { must: 0, bonus: 0 }
  );
}
