import { Box, Button, TextField, Tooltip } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import {
  ArrowExpandLeft as FromLastIcon,
  ArrowExpandRight as FromFirstIcon,
  CheckBold as SubmitIcon,
} from 'mdi-material-ui';
import React, { useCallback, useState } from 'react';

const useStyles = makeStyles((theme) =>
  createStyles({
    modeButtons: {
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
    },
    modeIcon: {
      marginRight: theme.spacing(1),
    },
    modeSubmitButton: {
      margin: 'auto 0px',
    },
  })
);

interface MapDynamicColumnInformation {
  count: number;
  selectionMode: 'first' | 'last';
}

interface MapDynamicFormProps {
  headerCount: number;
  onSubmit: (info: MapDynamicColumnInformation) => void;
}

function MapDynamicSettingsForm({ onSubmit, headerCount }: MapDynamicFormProps): JSX.Element {
  const classes = useStyles();
  const [count, setCount] = useState('1');
  const [mode, setMode] = useState<'first' | 'last'>('last');
  const [error, setError] = useState<string>();

  const validate = useCallback(
    (countToValidate: number) => {
      if (Number.isNaN(countToValidate)) {
        setError('Muss eine positive Zahl sein.');
      } else if (countToValidate <= 0) {
        setError('Die Anzahl muss positiv sein.');
      } else if (countToValidate > headerCount) {
        setError(`Höher als die maximale Spaltenanzahl (${headerCount}).`);
      } else {
        setError(undefined);
      }
    },
    [headerCount]
  );

  const handleSubmit = useCallback(() => {
    const countAsNumber = Number.parseInt(count);
    validate(countAsNumber);

    if (!error) {
      onSubmit({ count: countAsNumber, selectionMode: mode });
    }
  }, [count, mode, onSubmit, error, validate]);

  return (
    <Box display='flex' flexDirection='row'>
      <TextField
        label='Spaltenanzahl'
        type='number'
        value={count}
        onChange={(e) => {
          const newCount = e.target.value;
          setCount(newCount);
          validate(Number.parseInt(newCount, 10));
        }}
        helperText={!!error && error}
        error={!!error}
      />

      <ToggleButtonGroup
        exclusive
        value={mode}
        onChange={(_, newMode) => {
          if (!!newMode) {
            setMode(newMode);
          }
        }}
        className={classes.modeButtons}
      >
        <ToggleButton value='last'>
          <FromLastIcon className={classes.modeIcon} /> Von hinten
        </ToggleButton>
        <ToggleButton value='first'>
          <FromFirstIcon className={classes.modeIcon} /> Von vorne
        </ToggleButton>
      </ToggleButtonGroup>

      <Tooltip title='Bestätigen'>
        <Button
          startIcon={<SubmitIcon />}
          color='primary'
          onClick={handleSubmit}
          disabled={!!error}
        >
          Bestätigen
        </Button>
      </Tooltip>
    </Box>
  );
}

export default MapDynamicSettingsForm;
