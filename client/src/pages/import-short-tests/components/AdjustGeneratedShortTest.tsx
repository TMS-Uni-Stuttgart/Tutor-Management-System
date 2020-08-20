import { Box, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { useFormikContext } from 'formik';
import React, { useCallback, useEffect, useMemo } from 'react';
import ShortTestForm, { ShortTestFormState } from '../../../components/forms/ShortTestForm';
import { useMapColumnsHelpers } from '../../../components/import-csv/hooks/useMapColumnsHelpers';
import Placeholder from '../../../components/Placeholder';
import { useStepper } from '../../../components/stepper-with-buttons/context/StepperContext';
import { getAllShortTests } from '../../../hooks/fetching/ShortTests';
import { useCustomSnackbar } from '../../../hooks/snackbar/useCustomSnackbar';
import { useFetchState } from '../../../hooks/useFetchState';
import { FormikSubmitCallback } from '../../../types';
import { ShortTestColumns } from '../ImportShortTests';

const useStyles = makeStyles((theme) =>
  createStyles({
    form: {
      marginTop: theme.spacing(4),
    },
  })
);

function useStepperNextCallback(callback: () => unknown | Promise<unknown>): void {
  const { setNextCallback, removeNextCallback } = useStepper();

  useEffect(() => {
    setNextCallback(async () => {
      const isSuccess = await callback();

      if (!!isSuccess) {
        return { goToNext: false };
      } else {
        return { goToNext: false, error: true };
      }
    });

    return () => removeNextCallback();
  }, [setNextCallback, removeNextCallback, callback]);
}

function HookUpStepper(): null {
  const { submitForm } = useFormikContext<ShortTestFormState>();

  useStepperNextCallback(submitForm);

  return null;
}

function AdjustGeneratedShortTest(): JSX.Element {
  const classes = useStyles();
  const { data, mappedColumns } = useMapColumnsHelpers<ShortTestColumns>();
  const { isLoading, value: shortTests } = useFetchState({
    fetchFunction: getAllShortTests,
    immediate: true,
    params: [],
  });
  const { enqueueSnackbar } = useCustomSnackbar();

  const initialValues: ShortTestFormState = useMemo(() => {
    const nextShortTestNo: number | undefined = shortTests
      ? shortTests[shortTests.length - 1].shortTestNo + 1
      : undefined;

    return {
      shortTestNo: nextShortTestNo?.toString(10) ?? '',
      percentageNeeded: 0.5,
      exercises: [
        {
          exName: 'Gesamter Test',
          maxPoints: data.rows[0]?.data[mappedColumns.testMaximumPoints] ?? '0',
          bonus: false,
          subexercises: [],
        },
      ],
    };
  }, [shortTests, data.rows, mappedColumns.testMaximumPoints]);

  const handleSubmit: FormikSubmitCallback<ShortTestFormState> = useCallback(async (values) => {
    return true;
  }, []);

  return (
    <Box display='flex' flexDirection='column' flex={1}>
      <Typography variant='h4'>Importierten Kurztest anpassen</Typography>

      <Placeholder
        placeholderText='Keine Anpassung möglich'
        showPlaceholder={false}
        loading={isLoading}
      >
        <ShortTestForm
          onSubmit={handleSubmit}
          initialValues={initialValues}
          className={classes.form}
          hideSaveButton
        >
          <HookUpStepper />
        </ShortTestForm>
      </Placeholder>
    </Box>
  );
}

export default AdjustGeneratedShortTest;
