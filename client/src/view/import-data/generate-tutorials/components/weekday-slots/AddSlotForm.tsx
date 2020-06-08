import { Box, BoxProps, Grow, IconButton, TextField } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { DateTime, Interval } from 'luxon';
import { Check as AcceptIcon, Close as AbortIcon } from 'mdi-material-ui';
import React, { useState } from 'react';
import SelectInterval, {
  SelectIntervalMode,
} from '../../../../../components/select-interval/SelectInterval';

const useStyles = makeStyles((theme) =>
  createStyles({
    weekdayCountField: {
      margin: theme.spacing(0, 2),
    },
    weekdayEntryDeleteButton: {
      color: theme.palette.red.main,
    },
  })
);

interface Props extends BoxProps {
  onAccept: (data: AddSlotFormData) => void;
  onAbort: () => void;
}

export interface AddSlotFormData {
  interval: Interval;
  count: string;
}

function getDefaultInterval(): Interval {
  const currentTime = DateTime.local().startOf('minute');
  return Interval.fromDateTimes(currentTime, currentTime.plus({ minutes: 90 }));
}

function AddSlotForm({ onAbort, onAccept, ...props }: Props): JSX.Element {
  const classes = useStyles();
  const [interval, setInterval] = useState<Interval>(getDefaultInterval);
  const [count, setCount] = useState('1');

  const handleAccept = () => {
    onAccept({ count, interval });
  };

  return (
    <Grow in style={{ transformOrigin: 'center center 0' }} timeout={500}>
      <Box padding={1} display='flex' alignItems='center' justifyContent='center' {...props}>
        <SelectInterval
          mode={SelectIntervalMode.TIME}
          autoIncreaseStep={90}
          value={interval}
          onChange={(i) => setInterval(i)}
        />

        <TextField
          type='number'
          value={count}
          fullWidth
          variant='outlined'
          label='Anzahl'
          className={classes.weekdayCountField}
          onChange={(e) => setCount(e.target.value)}
        />

        <IconButton onClick={handleAccept}>
          <AcceptIcon />
        </IconButton>

        <IconButton onClick={onAbort}>
          <AbortIcon />
        </IconButton>
      </Box>
    </Grow>
  );
}

export default AddSlotForm;
