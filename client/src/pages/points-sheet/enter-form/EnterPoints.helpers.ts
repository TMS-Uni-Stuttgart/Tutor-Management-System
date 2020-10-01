import { IExerciseGradingDTO, IGradingDTO } from 'shared/model/Gradings';
import { Grading } from '../../../model/Grading';
import { PointsFormExerciseState, PointsFormState } from './components/EnterPointsForm.helpers';

interface ConvertToGradingDTOParams {
  values: PointsFormState;
  sheetId?: string;
  examId?: string;
  shortTestId?: string;
  prevGrading?: Grading;
}

/**
 * Converts the given form state of __one__ exercise to a valid IExerciseGradingDTO.
 *
 * @param state State representing exactly one exercise.
 */
function convertFormExerciseStateToPointMapEntry({
  comment,
  points,
}: PointsFormExerciseState): IExerciseGradingDTO {
  if (typeof points === 'string') {
    return {
      comment,
      points: points ? Number.parseFloat(points) : 0,
    };
  } else {
    const subExercisePoints: Map<string, number> = new Map();

    Object.entries(points).forEach(([subKey, value]) => {
      const parsedValue = value ? Number.parseFloat(value) : 0;
      subExercisePoints.set(subKey, !Number.isNaN(parsedValue) ? parsedValue : 0);
    });

    return {
      comment,
      subExercisePoints: [...subExercisePoints],
    };
  }
}

/**
 * Converts the given PointsFormState to a Map with the IExerciseGradingDTOs.
 *
 * @param values Form values of the point form.
 */
function convertFormStateToExerciseGradingDTOMap(
  values: PointsFormState
): Map<string, IExerciseGradingDTO> {
  const gradings = new Map<string, IExerciseGradingDTO>();

  Object.entries(values.exercises).forEach(([exerciseId, state]) => {
    gradings.set(exerciseId, convertFormExerciseStateToPointMapEntry(state));
  });

  return gradings;
}

export function getPointsFromState(values: PointsFormState): number {
  return Object.values(values.exercises).reduce((sum, { points }) => {
    if (typeof points === 'string') {
      return sum + Number.parseFloat(points);
    }

    return Object.values(points).reduce((pts, value) => {
      return pts + Number.parseFloat(value);
    }, sum);
  }, Number.parseFloat(values.additionalPoints));
}

export function convertFormStateToGradingDTO({
  values,
  sheetId,
  examId,
  shortTestId,
  prevGrading,
}: ConvertToGradingDTOParams): IGradingDTO {
  const exerciseGradings: Map<
    string,
    IExerciseGradingDTO
  > = convertFormStateToExerciseGradingDTOMap(values);
  const additionalPoints = values.additionalPoints ? Number.parseFloat(values.additionalPoints) : 0;

  return {
    sheetId,
    examId,
    shortTestId,
    exerciseGradings: [...exerciseGradings],
    createNewGrading: !prevGrading,
    comment: values.comment,
    additionalPoints,
  };
}
