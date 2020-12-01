import { Box, Typography } from '@material-ui/core';
import React, { useCallback } from 'react';
import { useCustomSnackbar } from '../../../hooks/snackbar/useCustomSnackbar';
import { NextStepCallback, useStepper } from '../../stepper-with-buttons/context/StepperContext';
import { useImportCSVContext } from '../ImportCSV.context';
import MapForm from './MapForm';

function MapCSVColumns(): JSX.Element {
  const { csvData, mapColumnsHelpers } = useImportCSVContext();
  const { enqueueSnackbar } = useCustomSnackbar();
  const { metadata } = mapColumnsHelpers;

  const stepperCallback: NextStepCallback = useCallback(async () => {
    // TODO: Add implementation for new form.
    return { goToNext: false };
    // const currentForm = formInstance.current;

    // if (!currentForm) {
    //   return { goToNext: false };
    // }

    // const errors = await currentForm.validateForm();

    // // Make sure that the errornous fields are "touched" so the errors are properly shown.
    // for (const key of Object.keys(errors)) {
    //   currentForm.setFieldTouched(key, true);
    // }

    // if (!currentForm.isValid) {
    //   enqueueSnackbar('Eingaben sind ungültig.', { variant: 'error' });
    //   return { goToNext: false, error: true };
    // }

    // for (const [key, value] of Object.entries(currentForm.values)) {
    //   mapColumnsHelpers.mapColumn(key, value);
    // }
    // // currentForm.resetForm({ values: currentForm.values });

    // return { goToNext: true };
  }, []);

  useStepper(stepperCallback);

  return (
    <Box width='100%'>
      <Typography variant='h4'>Spalten zuordnen</Typography>

      <MapForm headers={csvData.headers} metadata={metadata} />
    </Box>
  );
}

export default MapCSVColumns;
