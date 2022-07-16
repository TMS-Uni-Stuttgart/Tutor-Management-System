import { Box, Typography } from '@material-ui/core';
import { FormikProps } from 'formik';
import React, { RefObject, useCallback, useRef } from 'react';
import { useCustomSnackbar } from '../../../../hooks/snackbar/useCustomSnackbar';
import { NextStepCallback, useStepper } from '../../../stepper-with-buttons/context/StepperContext';
import { useImportCSVContext } from '../../ImportCSV.context';
import { CSVMapColumsMetadata, isDynamicColumnInformation } from '../../ImportCSV.types';
import MapForm, { MapFormValues } from './MapForm';

function validateForm(
  values: MapFormValues,
  metadata: CSVMapColumsMetadata<string, string>
): string[] {
  const errors: string[] = [];

  for (const [key, info] of Object.entries(metadata.information)) {
    if (info.required) {
      if (!values[key] || values[key].length === 0) {
        errors.push(`Zuordnung für "${info.label}" benötigt.`);
      }
    }

    if (isDynamicColumnInformation(info)) {
      if (!Array.isArray(values[key])) {
        errors.push(`Keine Liste für "${info.label}" zugeordnet.`);
      }
    }
  }

  return errors;
}

function useGenerateSaveCallback(
  formikRef: RefObject<FormikProps<MapFormValues>>
): NextStepCallback {
  const {
    mapColumnsHelpers: { mapColumn, metadata },
  } = useImportCSVContext();
  const { enqueueSnackbar, enqueueSnackbarWithList } = useCustomSnackbar();
  const callback: NextStepCallback = useCallback(async () => {
    const values = formikRef.current?.values;

    if (!values) {
      enqueueSnackbar('Spalten konnten nicht zugeordnet werden: NO_VALUES', {
        variant: 'error',
      });
      return { goToNext: false };
    }

    const errors = validateForm(values, metadata);

    if (errors.length > 0) {
      enqueueSnackbarWithList({
        title: 'Ungültige Zuordnung',
        textBeforeList: 'Die folgenden Fehler sind in der Zuordnung vorhanden:',
        items: errors,
        isOpen: true,
        variant: 'error',
      });
      return { goToNext: false, error: true };
    }

    for (const [key, value] of Object.entries(values)) {
      mapColumn(key, value);
    }

    enqueueSnackbar('Spalten erfolgreich zugeordnet.', { variant: 'success' });
    return { goToNext: true };
  }, [formikRef, mapColumn, metadata, enqueueSnackbar, enqueueSnackbarWithList]);

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
