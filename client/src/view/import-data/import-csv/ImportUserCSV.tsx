import { Box, TextField, Typography } from '@material-ui/core';
import { SnackbarKey, useSnackbar } from 'notistack';
import React, { useCallback, useEffect, useState } from 'react';
import SnackbarWithList from '../../../components/SnackbarWithList';
import {
  NextStepCallback,
  useStepper,
} from '../../../components/stepper-with-buttons/context/StepperContext';
import { getParsedCSV } from '../../../hooks/fetching/CSV';
import { useImportDataContext } from '../ImportUsers.context';

function ImportUserCSV(): JSX.Element {
  const { setNextCallback, removeNextCallback, setNextDisabled } = useStepper();
  const { setData, csvFormData, setCSVFormData } = useImportDataContext();
  const { enqueueSnackbar } = useSnackbar();

  const [csvInput, setCSVInput] = useState(csvFormData?.csvInput ?? '');
  const [seperator, setSeparator] = useState(csvFormData?.seperator ?? '');

  const handleSubmit: NextStepCallback = useCallback(async () => {
    try {
      const response = await getParsedCSV<{ [header: string]: string }>({
        data: csvInput.trim(),
        options: { header: true, delimiter: seperator },
      });

      if (response.errors.length === 0) {
        setData({ headers: response.meta.fields, rows: response.data });
        setCSVFormData({ csvInput, seperator });

        enqueueSnackbar('CSV erfolgreich importiert.', { variant: 'success' });
        return { goToNext: true };
      } else {
        enqueueSnackbar('', {
          persist: true,
          content: (id: SnackbarKey) => (
            <SnackbarWithList
              id={id}
              title='CSV konnte nicht importiert werden.'
              textBeforeList='Folgende Fehler sind aufgetreten:'
              items={response.errors.map((err) => `${err.message} (Zeile: ${err.row})`)}
            />
          ),
        });
        return { goToNext: false, error: true };
      }
    } catch {
      enqueueSnackbar('CSV konnte nicht importiert werden.', { variant: 'error' });
      return { goToNext: false, error: true };
    }
  }, [csvInput, seperator, setData, setCSVFormData, enqueueSnackbar]);

  useEffect(() => {
    setNextDisabled(!csvInput);
  }, [csvInput, setNextDisabled]);

  useEffect(() => {
    setNextCallback(handleSubmit);

    return removeNextCallback;
  }, [setNextCallback, removeNextCallback, handleSubmit]);

  return (
    <Box display='flex' flexDirection='column' width='100%'>
      <Box display='flex' marginBottom={2} alignItems='center'>
        <Typography variant='h4'>CSV importieren</Typography>

        {/* TODO: Oder Dropdown-Box? */}
        <TextField
          variant='outlined'
          label='Seperator'
          helperText='Leer lassen: Seperator wird automatisch bestimmt.'
          value={seperator}
          onChange={(e) => setSeparator(e.target.value)}
          style={{ marginLeft: 'auto' }}
        />
      </Box>

      <TextField
        variant='outlined'
        label='CSV Daten'
        placeholder='CSV hier einfügen'
        inputProps={{ rowsMin: 8 }}
        value={csvInput}
        onChange={(e) => setCSVInput(e.target.value)}
        fullWidth
        multiline
      />
    </Box>
  );
}

export default ImportUserCSV;
