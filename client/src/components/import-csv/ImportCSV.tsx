import {
  Box,
  Button,
  createStyles,
  Divider,
  makeStyles,
  TextField,
  Typography,
} from '@material-ui/core';
import { Upload as UploadIcon } from 'mdi-material-ui';
import React, { useCallback, useState } from 'react';
import { useDialog } from '../../hooks/DialogService';
import { useCustomSnackbar } from '../../hooks/snackbar/useCustomSnackbar';
import LoadingModal from '../loading/LoadingModal';
import { useImportCSVHelpers } from './ImportCSV.context';

const useStyles = makeStyles((theme) =>
  createStyles({
    divider: { flex: 1, margin: theme.spacing(0, 2) },
    uploadLabel: { flex: 1 },
    uploadButton: { width: '100%' },
  })
);

function ImportCSV(): JSX.Element {
  const classes = useStyles();
  const { enqueueSnackbar } = useCustomSnackbar();
  const { showConfirmationDialog } = useDialog();

  const { csvFormData, setCSVFormData, isLoading: isLoadingInContext } = useImportCSVHelpers();
  const [isLoadingCSV, setLoadingCSV] = useState(false);

  const setCSVInput = useCallback(
    (csvInput: string) => {
      setCSVFormData({ ...csvFormData, csvInput });
    },
    [csvFormData, setCSVFormData]
  );

  const setSeparator = useCallback(
    (separator: string) => {
      setCSVFormData({ ...csvFormData, separator });
    },
    [csvFormData, setCSVFormData]
  );

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
    if (!!csvFormData.csvInput) {
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

        <TextField
          variant='outlined'
          label='Seperator'
          helperText='Der Seperator wird automatisch bestimmt, wenn Feld leer'
          value={csvFormData.separator}
          onChange={(e) => setSeparator(e.target.value)}
          style={{ marginLeft: 'auto' }}
        />
      </Box>

      <TextField
        variant='outlined'
        label='CSV Daten einfügen'
        inputProps={{ rowsMin: 8 }}
        value={csvFormData.csvInput}
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

      <LoadingModal modalText='Importiere CSV...' open={isLoadingInContext || isLoadingCSV} />
    </Box>
  );
}

export default ImportCSV;
