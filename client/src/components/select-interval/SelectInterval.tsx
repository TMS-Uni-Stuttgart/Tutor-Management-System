import { Box, BoxProps } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { DatePicker } from '@material-ui/pickers';
import { DateTime, Interval } from 'luxon';
import React, { useEffect, useState } from 'react';

const useStyles = makeStyles(() =>
  createStyles({
    startPicker: {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    },
    endPicker: {
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    },
  })
);

interface Props extends Omit<BoxProps, 'onChange'> {
  value?: Interval;
  autoIncreaseStep?: number;
  onChange?: (newValue: Interval, oldValue: Interval) => void;
}

interface TouchedState {
  start: boolean;
  end: boolean;
}

function getDefaultInterval(): Interval {
  return Interval.fromDateTimes(DateTime.local(), DateTime.local().plus({ days: 1 }));
}

function SelectInterval({
  value: valueFromProps,
  autoIncreaseStep,
  onChange,
  ...props
}: Props): JSX.Element {
  const classes = useStyles();
  const [value, setInternalValue] = useState<Interval>(
    () => valueFromProps ?? getDefaultInterval()
  );
  const [touched, setTouched] = useState<TouchedState>({ start: false, end: false });

  useEffect(() => {
    setInternalValue(valueFromProps ?? getDefaultInterval());
  }, [valueFromProps]);

  const setValue = (newValue: Interval) => {
    const oldValue = value;
    setInternalValue(newValue);

    if (onChange) {
      onChange(newValue, oldValue);
    }
  };

  return (
    <Box display='flex' {...props}>
      <DatePicker
        label='Von'
        value={value.start}
        variant='inline'
        format='EEE, dd MMMM yyyy'
        fullWidth
        inputVariant='outlined'
        InputProps={{ className: classes.startPicker }}
        onBlur={() => setTouched({ ...touched, start: true })}
        onChange={(date) => {
          if (!!date) {
            let endDate: DateTime;

            if (date <= value.end) {
              endDate = touched.end ? value.end : date.plus({ days: autoIncreaseStep ?? 1 });
            } else {
              endDate = date.plus({ days: autoIncreaseStep ?? 1 });
              setTouched({ ...touched, end: false });
            }

            setValue(Interval.fromDateTimes(date, endDate));
          }
        }}
      />
      <DatePicker
        label='Bis'
        value={value.end}
        InputProps={{ className: classes.endPicker }}
        variant='inline'
        format='EEE, dd MMMM yyyy'
        autoOk
        fullWidth
        inputVariant='outlined'
        minDate={value.start.plus({ days: 1 })}
        onBlur={() => setTouched({ ...touched, end: true })}
        onChange={(date) => {
          if (!!date && date >= value.start) {
            setValue(Interval.fromDateTimes(value.start, date));
          }
        }}
      />
    </Box>
  );
}

export default SelectInterval;
