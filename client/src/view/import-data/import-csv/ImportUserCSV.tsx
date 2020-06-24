import { Box, Button, Divider, TextField, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Upload as UploadIcon } from 'mdi-material-ui';
import { SnackbarKey, useSnackbar } from 'notistack';
import React, { useCallback, useEffect, useState } from 'react';
import LoadingModal from '../../../components/loading/LoadingModal';
import SnackbarWithList from '../../../components/SnackbarWithList';
import {
  NextStepCallback,
  useStepper,
} from '../../../components/stepper-with-buttons/context/StepperContext';
import { useDialog } from '../../../hooks/DialogService';
import { getParsedCSV } from '../../../hooks/fetching/CSV';
import { useImportDataContext } from '../ImportUsers.context';

const useStyles = makeStyles((theme) =>
  createStyles({
    divider: { flex: 1, margin: theme.spacing(0, 2) },
    uploadLabel: { flex: 1 },
    uploadButton: { width: '100%' },
  })
);

function ImportUserCSV(): JSX.Element {
  const classes = useStyles();

  const { setNextCallback, removeNextCallback, setNextDisabled } = useStepper();
  const { setData, csvFormData, setCSVFormData } = useImportDataContext();
  const { enqueueSnackbar } = useSnackbar();
  const { showConfirmationDialog } = useDialog();

  const [csvInput, setCSVInput] = useState(csvFormData?.csvInput ?? '');
  const [seperator, setSeparator] = useState(csvFormData?.seperator ?? '');
  const [isLoadingCSV, setLoadingCSV] = useState(false);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // We need the target after async code to reset the text field.
    e.persist();
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.type !== 'application/vnd.ms-excel') {
      enqueueSnackbar('Ausgewählte Datei ist keine CSV-Datei.', { variant: 'error' });
      return;
    }

    setLoadingCSV(true);
    if (!!csvInput) {
      const overrideExisting = await showConfirmationDialog({
        title: 'Überschreiben?',
        content:
          'Es sind noch Daten im Textfeld vorhanden. Sollen diese wirklich überschrieben werden?',
        acceptProps: { label: 'Überschreiben', deleteButton: true },
        cancelProps: { label: 'Nicht überschreiben' },
      });

      if (!overrideExisting) {
        setLoadingCSV(false);
        return;
      }
    }
    const content: string = await file.text();

    // Reset the file so the user could select the same file twice.
    e.target.value = '';
    setCSVInput(content);
    setLoadingCSV(false);
  };

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
        label='CSV Daten einfügen'
        inputProps={{ rowsMin: 8 }}
        value={csvInput}
        onChange={(e) => setCSVInput(e.target.value)}
        fullWidth
        multiline
      />

      <Box display='flex' alignItems='center' marginY={2}>
        <Divider className={classes.divider} />
        <Typography>ODER</Typography>
        <Divider className={classes.divider} />
      </Box>

      <Box display='flex'>
        <input
          accept='.csv'
          style={{ display: 'none' }}
          id='icon-button-file'
          type='file'
          onChange={handleFileUpload}
        />
        <label htmlFor='icon-button-file' className={classes.uploadLabel}>
          <Button
            variant='outlined'
            disableElevation
            className={classes.uploadButton}
            component='span'
            startIcon={<UploadIcon />}
          >
            CSV-Datei hochladen
          </Button>
        </label>
      </Box>

      <LoadingModal modalText='Importiere CSV...' open={isLoadingCSV} />
    </Box>
  );
}

export default ImportUserCSV;
