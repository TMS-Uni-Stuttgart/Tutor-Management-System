import { Box, BoxProps, TextField, Typography } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { DatePicker, DatePickerProps, TimePicker, TimePickerProps } from '@mui/x-date-pickers';
import { DateTime, DateTimeFormatOptions, DurationLikeObject, Interval } from 'luxon';
import React, { useCallback, useEffect, useState } from 'react';

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

export enum SelectIntervalMode {
  DATE,
  TIME,
}

interface Props extends Omit<BoxProps, 'onChange'> {
  value?: Interval;
  onChange?: (newValue: Interval, oldValue: Interval) => void;

  /**
   * Mode of the picker component. Defaults to `DATE` if not present.
   *
   * Changes the behaviour of the component and what one wants to select:
   * - `DATE`: Select a range of dates.
   * - `TIME`: Select a range of time (hour & minutes) on the same day.
   */
  mode?: SelectIntervalMode;

  /**
   * The unit depends on the selected `mode`: If `mode` is set to `DATE` the unit is 'days'. If it is set to `TIME` the unit is 'minutes'.
   */
  autoIncreaseStep?: number;

  /**
   * Disables keyboard input. Defaults to `false`.
   *
   * **Currently only `TIME` is using keyboard input**.
   */
  disableKeyboard?: boolean;
}

interface TouchedState {
  start: boolean;
  end: boolean;
}

interface ValueState {
  lastValid: Interval;
}

function getDefaultInterval(): Interval {
  return Interval.fromDateTimes(DateTime.local(), DateTime.local().plus({ days: 1 }));
}

function getFormatForMode(mode: SelectIntervalMode): {
  display: DateTimeFormatOptions;
  mask: string;
} {
  switch (mode) {
    case SelectIntervalMode.DATE:
      return {
        mask: 'dd.MM.yyyy',
        display: {
          weekday: 'short',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        },
      };
    case SelectIntervalMode.TIME:
      return {
        mask: 'HH:mm',
        display: { hour: '2-digit', minute: '2-digit', hour12: false },
      };
    default:
      throw new Error(`No format available for mode ${mode}`);
  }
}

function getComponentForMode(
  mode: SelectIntervalMode,
  isKeyboardDisabled: boolean
): React.FC<DatePickerProps> | React.FC<TimePickerProps> {
  switch (mode) {
    case SelectIntervalMode.DATE:
      return DatePicker;
    case SelectIntervalMode.TIME:
      return TimePicker;
    default:
      throw new Error(`No component available for mode ${mode}`);
  }
}

function getDurationToAdd(mode: SelectIntervalMode, steps: number = 1): DurationLikeObject {
  switch (mode) {
    case SelectIntervalMode.DATE:
      return { days: steps };
    case SelectIntervalMode.TIME:
      return { minutes: steps };
    default:
      throw new Error(`No duration available for mode ${mode}`);
  }
}

function isOneTouched(touched: TouchedState): boolean {
  return Object.values(touched).reduce((prev, current) => prev || current, false);
}

function SelectInterval({
  value: valueFromProps,
  autoIncreaseStep,
  onChange,
  mode: modeFromProps,
  disableKeyboard,
  ...props
}: Props): JSX.Element {
  const classes = useStyles();
  const [touched, setTouched] = useState<TouchedState>({ start: false, end: false });
  const [error, setError] = useState<string>();
  const [{ lastValid }, setInternalValue] = useState<ValueState>(() => ({
    lastValid: !!valueFromProps && valueFromProps.isValid ? valueFromProps : getDefaultInterval(),
  }));

  const mode = modeFromProps ?? SelectIntervalMode.DATE;
  const format = getFormatForMode(mode);
  const Component = getComponentForMode(mode, disableKeyboard ?? false);
  const displayError = !!error && isOneTouched(touched);

  const updateInternalValue = useCallback(
    (newValue: Interval | undefined) => {
      setInternalValue({
        lastValid: newValue?.isValid ? newValue : lastValid,
      });
    },
    [lastValid]
  );

  useEffect(() => {
    updateInternalValue(valueFromProps);
  }, [valueFromProps, updateInternalValue]);

  const setValue = (newValue: Interval) => {
    if (!valueFromProps) {
      updateInternalValue(newValue);
    }

    if (newValue.isValid) {
      if (onChange) {
        onChange(newValue, lastValid);
      }

      setError(undefined);
    } else {
      if (onChange) {
        onChange(newValue, lastValid);
      }

      setError('Zeitbereich ungültig.');
    }
  };

  const labelFunc = (date: DateTime | null, invalidLabel: string) => {
    const label = date?.toLocaleString(format.display);

    return label ?? invalidLabel;
  };

  const handleStartChanged = (date: unknown) => {
    const typedDate = date as DateTime | null;
    if (!typedDate) {
      setValue(Interval.invalid('Start date not defined.'));
      return;
    }

    const durationToAdd = getDurationToAdd(mode, autoIncreaseStep);
    let endDate: DateTime | null = lastValid.end;

    if (typedDate.isValid) {
      if (lastValid.end && typedDate <= lastValid.end) {
        endDate = touched.end ? lastValid.end : typedDate.plus(durationToAdd);
      } else {
        endDate = typedDate.plus(durationToAdd);
      }
    }

    setValue(Interval.fromDateTimes(typedDate, endDate ?? DateTime.local()));
  };

  const handleEndChanged = (date: unknown) => {
    const typedDate = date as DateTime | null;
    if (!!typedDate) {
      setValue(Interval.fromDateTimes(lastValid.start ?? DateTime.local(), typedDate));
    } else {
      setValue(Interval.invalid('End date not defined.'));
    }
  };

  return (
    <Box display='flex' flexDirection='column' {...props}>
      <Box display='flex'>
        <Component
          label='Von'
          value={lastValid.start}
          inputFormat={format.mask}
          ampm={false}
          onChange={handleStartChanged}
          renderInput={(props) => (
            <TextField
              {...props}
              fullWidth
              variant='outlined'
              InputProps={{ className: classes.startPicker }}
              onBlur={() => setTouched({ ...touched, start: true })}
              error={displayError}
            />
          )}
        />
        <Component
          label='Bis'
          value={lastValid.end}
          inputFormat={format.mask}
          ampm={false}
          minDate={lastValid.start?.plus({ days: 1 })}
          onChange={handleEndChanged}
          renderInput={(props) => (
            <TextField
              {...props}
              fullWidth
              variant='outlined'
              InputProps={{ className: classes.endPicker }}
              onBlur={() => setTouched({ ...touched, end: true })}
              error={displayError}
            />
          )}
        />
      </Box>

      {displayError && <Typography color='error'>{error}</Typography>}
    </Box>
  );
}

export default SelectInterval;
