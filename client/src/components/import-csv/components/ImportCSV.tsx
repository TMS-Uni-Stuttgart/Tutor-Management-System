import { Box, TextField, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { FileTableOutline as FileImportIcon, Text as TextImportIcon } from 'mdi-material-ui';
import React, { MouseEvent, useCallback, useEffect, useState } from 'react';
import { useCustomSnackbar } from '../../../hooks/snackbar/useCustomSnackbar';
import InformationButton from '../../information-box/InformationButton';
import LoadingModal from '../../loading/LoadingModal';
import { NextStepCallback, useStepper } from '../../stepper-with-buttons/context/StepperContext';
import submitCSV from '../helpers/submitCSV';
import { useImportCSVContext } from '../ImportCSV.context';
import ImportCSVFromFile, { FileInformation } from './ImportCSVFromFile';

const useStyles = makeStyles((theme) =>
  createStyles({
    modeButtons: {
      marginRight: theme.spacing(2),
    },
    modeIcon: {
      marginRight: theme.spacing(1),
    },
  })
);

interface Props {
  infoLabel?: string;
  infoContent?: React.ReactNode;
}

enum ImportMode {
  FILE = 'FILE',
  TEXT = 'TEXT',
}

function ImportCSV({ infoLabel, infoContent }: Props): JSX.Element {
  const classes = useStyles();
  const { enqueueSnackbar, enqueueSnackbarWithList } = useCustomSnackbar();
  const { setCSVData } = useImportCSVContext();

  const [fileInfo, setFileInfo] = useState<FileInformation>({ content: '', fileName: '' });
  const [textFieldValue, setTextFieldValue] = useState<string>('');
  const [mode, setMode] = useState<string>(ImportMode.FILE);
  const [separator, setSeparator] = useState<string>('');

  const handleSubmitCSV = useCallback<NextStepCallback>(async () => {
    const csv = mode === ImportMode.FILE ? fileInfo.content : textFieldValue;

    return submitCSV({ csv, separator, setCSVData, enqueueSnackbar, enqueueSnackbarWithList });
  }, [
    fileInfo.content,
    mode,
    textFieldValue,
    separator,
    setCSVData,
    enqueueSnackbar,
    enqueueSnackbarWithList,
  ]);

  const handleModeChange = useCallback((_: MouseEvent<HTMLElement>, newMode: string | null) => {
    if (!!newMode) {
      setMode(newMode);
    }
  }, []);

  const { setNextDisabled, isWaitingOnNextCallback } = useStepper(handleSubmitCSV);

  useEffect(() => {
    setNextDisabled(mode === ImportMode.FILE ? !fileInfo.content : !textFieldValue);
  }, [mode, fileInfo, textFieldValue, setNextDisabled]);

  return (
    <Box
      display='grid'
      gridRowGap={16}
      gridColumnGap={8}
      gridTemplateRows='max-content 1fr'
      gridTemplateColumns='1fr max-content'
      width='100%'
      paddingTop={1}
    >
      <Box
        gridArea='1 / 1'
        display='grid'
        gridGap={8}
        gridAutoFlow='row'
        gridAutoColumns='max-content'
        justifyItems='flex-start'
        alignItems='flex-start'
      >
        <Typography variant='h4'>CSV importieren</Typography>

        {!!infoContent && (
          <InformationButton size='small' information={infoContent}>
            {infoLabel}
          </InformationButton>
        )}
      </Box>

      <Box
        gridArea='1 / 2'
        display='grid'
        gridAutoFlow='column'
        gridAutoColumns='auto'
        alignItems='flex-start'
        gridColumnGap={8}
      >
        <ToggleButtonGroup exclusive value={mode} onChange={handleModeChange}>
          <ToggleButton value={ImportMode.FILE}>
            <FileImportIcon className={classes.modeIcon} /> Datei
          </ToggleButton>
          <ToggleButton value={ImportMode.TEXT}>
            <TextImportIcon className={classes.modeIcon} /> Text
          </ToggleButton>
        </ToggleButtonGroup>

        <TextField
          variant='outlined'
          label='Seperator'
          helperText='Der Seperator wird automatisch bestimmt, wenn Feld leer'
          value={separator}
          onChange={(e) => setSeparator(e.target.value)}
        />
      </Box>

      <Box
        gridArea='2 / 1 / span 1 / span 2'
        overflow='auto'
        display='flex'
        flexDirection='column'
        paddingTop={1}
      >
        {mode === ImportMode.FILE ? (
          <ImportCSVFromFile
            fileInfo={fileInfo}
            onFileInfoChanged={(newInfo) => setFileInfo(newInfo)}
          />
        ) : (
          <TextField
            label='CSV Daten einfügen'
            inputProps={{ rowsMin: 8 }}
            value={textFieldValue}
            onChange={(e) => setTextFieldValue(e.target.value)}
            fullWidth
            multiline
          />
        )}
      </Box>

      <LoadingModal modalText='Importiere CSV...' open={isWaitingOnNextCallback} />
    </Box>
  );
}

export default ImportCSV;
