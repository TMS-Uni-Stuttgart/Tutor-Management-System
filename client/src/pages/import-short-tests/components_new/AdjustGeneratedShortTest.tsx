import { Box, Typography } from '@material-ui/core';
import { useFormikContext } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { ExerciseFormExercise } from '../../../components/forms/components/FormikExerciseEditor';
import ShortTestForm, { ShortTestFormState } from '../../../components/forms/ShortTestForm';
import { useImportCSVContext } from '../../../components/import-csv-new/ImportCSV.context';
import { CSVMappedColumns } from '../../../components/import-csv-new/ImportCSV.types';
import { CSVDataRow } from '../../../components/import-csv/ImportCSV.types';
import LoadingModal from '../../../components/loading/LoadingModal';
import Placeholder from '../../../components/Placeholder';
import { useStepper } from '../../../components/stepper-with-buttons/context/StepperContext';
import { getAllShortTests } from '../../../hooks/fetching/ShortTests';
import { useFetchState } from '../../../hooks/useFetchState';
import { ShortTest } from '../../../model/ShortTest';
import { ROUTES } from '../../../routes/Routing.routes';
import { FormikSubmitCallback } from '../../../types';
import { ShortTestColumns } from '../ImportShortTests';
import { useIliasMappingContext } from './map-students-ilias-names/IliasMapping.context';

function HookUpStepper(): null {
  const history = useHistory();
  const { submitForm } = useFormikContext<ShortTestFormState>();

  const { setNextCallback, removeNextCallback } = useStepper();

  useEffect(() => {
    setNextCallback(async () => {
      const isSuccess: any = await submitForm();

      if (!!isSuccess) {
        return {
          goToNext: true,
          runAfterFinished: () => {
            history.push(ROUTES.MANAGE_HAND_INS.create({ location: '1' }));
          },
        };
      } else {
        return { goToNext: false, error: true };
      }
    });

    return () => removeNextCallback();
  }, [setNextCallback, removeNextCallback, submitForm, history]);

  return null;
}

async function generateInitialValues(
  shortTest: ShortTest | undefined,
  mappedColumns: CSVMappedColumns<ShortTestColumns>,
  csvRows: CSVDataRow[]
): Promise<ShortTestFormState | undefined> {
  if (shortTest) {
    return undefined;
  }

  const shortTests: ShortTest[] = await getAllShortTests();

  const nextShortTestNo: number | undefined =
    shortTests && shortTests.length > 0
      ? shortTests[shortTests.length - 1].shortTestNo + 1
      : undefined;

  if (!Array.isArray(mappedColumns.exercises)) {
    return undefined;
  }

  const exercises: ExerciseFormExercise[] = [];

  for (const exerciseColumn of mappedColumns.exercises) {
    let maxPoints = 0;

    for (const row of csvRows) {
      const pointsOfStudent: number = Number.parseFloat(row.data[exerciseColumn]);

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
    shortTestNo: nextShortTestNo?.toString(10) ?? '1',
    percentageNeeded: 0.5,
    exercises,
  };
}

function AdjustGeneratedShortTest(): JSX.Element {
  const {
    csvData,
    mapColumnsHelpers: { mappedColumns, metadata },
  } = useImportCSVContext<ShortTestColumns, string>();
  const { getMapping, shortTest } = useIliasMappingContext();
  const [isImporting, setImporting] = useState(false);
  const { isLoading, value: initialValues } = useFetchState({
    fetchFunction: generateInitialValues,
    immediate: true,
    params: [shortTest, mappedColumns, csvData.rows],
  });

  const handleSubmit: FormikSubmitCallback<ShortTestFormState> = useCallback(async () => {
    // TODO: Implement me!
    return false;
  }, []);

  return (
    <Box display='grid' gridRowGap={32} width='100%' gridTemplateRows='auto 1fr'>
      <Typography variant='h4'>Importierten Kurztest anpassen</Typography>

      <Placeholder
        loading={isLoading}
        placeholderText='Generiere Kurztest...'
        showPlaceholder={!initialValues}
      >
        {/* TODO: Show error if generated total points do NOT match the total points inside the CSV data. */}
        <ShortTestForm
          onSubmit={handleSubmit}
          initialValues={initialValues}
          shortTest={shortTest}
          editorProps={{
            disableAutofocus: true,
            disableSubExercises: true,
          }}
          hideSaveButton
        >
          <HookUpStepper />
        </ShortTestForm>
      </Placeholder>

      <LoadingModal modalText='Importiere Kurztestergebnisse...' open={isImporting} />
    </Box>
  );
}

export default AdjustGeneratedShortTest;
