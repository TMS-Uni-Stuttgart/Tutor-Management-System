import { Box, Typography } from '@material-ui/core';
import { FormikProps } from 'formik';
import React, { RefObject, useCallback, useRef } from 'react';
import { useCustomSnackbar } from '../../../hooks/snackbar/useCustomSnackbar';
import { NextStepCallback, useStepper } from '../../stepper-with-buttons/context/StepperContext';
import { useImportCSVContext } from '../ImportCSV.context';
import MapForm, { MapFormValues } from './MapForm';

function useGenerateSaveCallback(
  formikRef: RefObject<FormikProps<MapFormValues>>
): NextStepCallback {
  const { enqueueSnackbar } = useCustomSnackbar();
  const callback: NextStepCallback = useCallback(async () => {
    // TODO: Add implementation for new form.
    return { goToNext: false };
  }, []);

  return callback;
}

function MapCSVColumns(): JSX.Element {
  const { csvData, mapColumnsHelpers } = useImportCSVContext();
  const { metadata } = mapColumnsHelpers;

  // Pass in `null` to make sure that a `RefObject` is returned as type.
  const formikRef: RefObject<FormikProps<MapFormValues>> = useRef(null);
  const stepperCallback: NextStepCallback = useGenerateSaveCallback(formikRef);

  useStepper(stepperCallback);

  return (
    <Box width='100%'>
      <Typography variant='h4'>Spalten zuordnen</Typography>

      <MapForm
        formikRef={formikRef}
        headers={csvData.headers}
        metadata={metadata}
        onSubmit={stepperCallback}
      />
    </Box>
  );
}

export default MapCSVColumns;
