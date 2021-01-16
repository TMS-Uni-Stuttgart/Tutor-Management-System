import { Box, Typography } from '@material-ui/core';
import { FormikErrors, useFormikContext } from 'formik';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router';
import ShortTestForm, { ShortTestFormState } from '../../../../components/forms/ShortTestForm';
import { useImportCSVContext } from '../../../../components/import-csv-new/ImportCSV.context';
import LoadingModal from '../../../../components/loading/LoadingModal';
import Placeholder from '../../../../components/Placeholder';
import { useStepper } from '../../../../components/stepper-with-buttons/context/StepperContext';
import { useFetchState } from '../../../../hooks/useFetchState';
import { ROUTES } from '../../../../routes/Routing.routes';
import { FormikSubmitCallback } from '../../../../types';
import { ShortTestColumns } from '../../ImportShortTests';
import { useIliasMappingContext } from '../map-students-ilias-names/IliasMapping.context';
import { generateInitialValues, validateExercises, validateShortTestNumber } from './formHelpers';

type ShortTestValidator = (values: ShortTestFormState) => FormikErrors<ShortTestFormState>;

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

function AdjustGeneratedShortTest(): JSX.Element {
  const {
    csvData,
    mapColumnsHelpers: { mappedColumns },
  } = useImportCSVContext<ShortTestColumns, string>();
  const { getMapping, shortTest } = useIliasMappingContext();
  const [isImporting, setImporting] = useState(false);
  const { isLoading, value } = useFetchState({
    fetchFunction: generateInitialValues,
    immediate: true,
    params: [shortTest, mappedColumns, csvData.rows],
  });

  const totalPointsOfTest: number = useMemo(() => {
    const key = mappedColumns.testMaximumPoints;

    if (Array.isArray(key)) {
      return 0;
    }

    const points: number = Number.parseInt(csvData.rows[0]?.data[key] ?? 0, 10);

    return Number.isNaN(points) ? 0 : points;
  }, [csvData.rows, mappedColumns.testMaximumPoints]);

  const validateShortTest: ShortTestValidator = useCallback(
    (values) => {
      return {
        shortTestNo: validateShortTestNumber(values, shortTest, value?.shortTests ?? []),
        exercises: validateExercises(values, totalPointsOfTest),
      };
    },
    [totalPointsOfTest, value?.shortTests, shortTest]
  );

  const handleSubmit: FormikSubmitCallback<ShortTestFormState> = useCallback(
    async (values, helpers) => {
      // TODO: Implement me!
      return false;
    },
    []
  );

  return (
    <Box display='grid' gridRowGap={32} width='100%' gridTemplateRows='auto 1fr'>
      <Typography variant='h4'>Importierten Kurztest anpassen</Typography>

      <Placeholder
        loading={isLoading}
        placeholderText='Generiere Kurztest...'
        showPlaceholder={!value?.initialValues}
      >
        <ShortTestForm
          onSubmit={handleSubmit}
          initialValues={value?.initialValues}
          shortTest={shortTest}
          editorProps={{
            disableAutofocus: true,
            disableSubExercises: true,
          }}
          hideSaveButton
          validate={validateShortTest}
          validateOnMount
          initialTouched={{ exercises: [] }}
        >
          <HookUpStepper />
        </ShortTestForm>
      </Placeholder>

      <LoadingModal modalText='Importiere Kurztestergebnisse...' open={isImporting} />
    </Box>
  );
}

export default AdjustGeneratedShortTest;
