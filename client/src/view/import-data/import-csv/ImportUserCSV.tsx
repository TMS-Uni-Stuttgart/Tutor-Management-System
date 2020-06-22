import { Box, TextField, Typography } from '@material-ui/core';
import React, { useEffect, useCallback, useState } from 'react';
import {
  useStepper,
  NextStepCallback,
} from '../../../components/stepper-with-buttons/context/StepperContext';
import { getParsedCSV } from '../../../hooks/fetching/CSV';
import { useImportDataContext } from '../ImportUsers.context';
import { useSnackbar, SnackbarKey } from 'notistack';
import SnackbarWithList from '../../../components/SnackbarWithList';

function ImportUserCSV(): JSX.Element {
  const { setNextCallback, removeNextCallback, setNextDisabled } = useStepper();
  const { setData } = useImportDataContext();
  const { enqueueSnackbar } = useSnackbar();

  const [csvInput, setCSVInput] = useState('');
  const [separator, setSeparator] = useState('');

  const handleSubmit: NextStepCallback = useCallback(async () => {
    try {
      const response = await getParsedCSV<{ [header: string]: string }>({
        data: csvInput.trim(),
        options: { header: true, delimiter: separator },
      });

      if (response.errors.length === 0) {
        setData({ headers: response.meta.fields, rows: response.data });

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
  }, [csvInput, separator, setData, enqueueSnackbar]);

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
          value={separator}
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
