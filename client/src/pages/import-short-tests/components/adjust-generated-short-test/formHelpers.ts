import { ExerciseFormExercise } from '../../../../components/forms/components/FormikExerciseEditor';
import { ShortTestFormState } from '../../../../components/forms/ShortTestForm';
import { CSVDataRow, CSVMappedColumns } from '../../../../components/import-csv/ImportCSV.types';
import { getAllShortTests } from '../../../../hooks/fetching/ShortTests';
import { ShortTest } from '../../../../model/ShortTest';
import { ShortTestColumns } from '../ImportShortTests';

interface InitialData {
  shortTests: ShortTest[];
  initialValues: ShortTestFormState | undefined;
}

export async function generateInitialValues(
  shortTest: ShortTest | undefined,
  mappedColumns: CSVMappedColumns<ShortTestColumns>,
  csvRows: CSVDataRow[]
): Promise<InitialData> {
  const shortTests: ShortTest[] = await getAllShortTests();

  if (shortTest || !Array.isArray(mappedColumns.exercises)) {
    return { shortTests, initialValues: undefined };
  }

  const nextShortTestNo: number | undefined =
    shortTests && shortTests.length > 0
      ? shortTests[shortTests.length - 1].shortTestNo + 1
      : undefined;

  const exercises: ExerciseFormExercise[] = [];

  for (const exerciseColumn of mappedColumns.exercises) {
    let maxPoints = 0;

    for (const row of csvRows) {
      const pointsOfStudent: number = Number.parseFloat(
        row.data[exerciseColumn].replace(/,/g, '.')
      );

      if (pointsOfStudent > maxPoints) {
        maxPoints = pointsOfStudent;
      }
    }

    exercises.push({
      exName: exerciseColumn,
      maxPoints: maxPoints.toString(10),
      bonus: false,
      subexercises: [],
    });
  }

  return {
    shortTests,
    initialValues: {
      shortTestNo: nextShortTestNo?.toString(10) ?? '1',
      percentageNeeded: 0.5,
      exercises,
    },
  };
}

export function validateShortTestNumber(
  values: ShortTestFormState,
  shortTest: ShortTest | undefined,
  shortTests: ShortTest[]
): string | undefined {
  const shortTestNo: number = Number.parseFloat(values.shortTestNo);

  if (Number.isNaN(shortTestNo) || !Number.isInteger(shortTestNo) || shortTestNo < 0) {
    return 'Muss eine nicht-negative ganze Zahl sein';
  }

  for (const test of shortTests) {
    if (test.shortTestNo === shortTestNo && shortTestNo !== shortTest?.shortTestNo) {
      return 'Es gibt bereits einen Test mit dieser Nummer.';
    }
  }

  return undefined;
}

export function validateExercises(
  values: ShortTestFormState,
  totalPointsOfTest: number
): string | undefined {
  const totalPointsInForm: number = values.exercises.reduce(
    (pts, ex) => pts + Number.parseFloat(ex.maxPoints),
    0
  );

  if (Number.isNaN(totalPointsInForm)) {
    return 'Gesamtpunktzahl ist keine gültige Dezimalzahl.';
  }

  if (totalPointsInForm !== totalPointsOfTest) {
    return `Aufgaben haben nicht die korrekte Anzahl an Punkten (Erforderlich: ${totalPointsOfTest} Pkt.).`;
  }

  return undefined;
}
