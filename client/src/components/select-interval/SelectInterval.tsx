import { Box, BoxProps } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import {
  DatePicker,
  TimePicker,
  DatePickerProps,
  TimePickerProps,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import { DateTime, Interval, DurationObject, DateTimeFormatOptions } from 'luxon';
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

function getDefaultInterval(): Interval {
  return Interval.fromDateTimes(DateTime.local(), DateTime.local().plus({ days: 1 }));
}

function getFormatForMode(
  mode: SelectIntervalMode
): { display: DateTimeFormatOptions; mask: string } {
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
      return { mask: 'HH:mm', display: { hour: '2-digit', minute: '2-digit', hour12: false } };
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
      return isKeyboardDisabled ? DatePicker : KeyboardDatePicker;
    case SelectIntervalMode.TIME:
      return isKeyboardDisabled ? TimePicker : KeyboardTimePicker;
    default:
      throw new Error(`No component available for mode ${mode}`);
  }
}

function getDurationToAdd(mode: SelectIntervalMode, steps: number = 1): DurationObject {
  switch (mode) {
    case SelectIntervalMode.DATE:
      return { days: steps };
    case SelectIntervalMode.TIME:
      return { minutes: steps };
    default:
      throw new Error(`No duration available for mode ${mode}`);
  }
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
  const [value, setInternalValue] = useState<Interval>(
    () => valueFromProps ?? getDefaultInterval()
  );
  const mode = modeFromProps ?? SelectIntervalMode.DATE;
  const format = getFormatForMode(mode);
  const Component = getComponentForMode(mode, disableKeyboard ?? false);

  useEffect(() => {
    setInternalValue(valueFromProps ?? getDefaultInterval());
  }, [valueFromProps]);

  const setValue = (newValue: Interval) => {
    const oldValue = value;

    if (!valueFromProps) {
      setInternalValue(newValue);
    }

    if (onChange) {
      onChange(newValue, oldValue);
    }
  };

  const labelFunc = (date: DateTime | null, invalidLabel: string) => {
    if (!date || !date.isValid) {
      return invalidLabel;
    }

    return date.toLocaleString(format.display);
  };

  return (
    <Box display='flex' {...props}>
      <Component
        label='Von'
        value={value.start}
        variant='inline'
        format={format.mask}
        labelFunc={labelFunc}
        ampm={false}
        fullWidth
        inputVariant='outlined'
        InputProps={{ className: classes.startPicker }}
        onBlur={() => setTouched({ ...touched, start: true })}
        onChange={(date: DateTime | null) => {
          if (!!date && date.isValid) {
            const durationToAdd = getDurationToAdd(mode, autoIncreaseStep);
            let endTouched = touched.end;
            let endDate: DateTime;

            if (date <= value.end) {
              endDate = touched.end ? value.end : date.plus(durationToAdd);
            } else {
              endDate = date.plus(durationToAdd);
              endTouched = false;
            }

            setTouched({ start: true, end: endTouched });
            setValue(Interval.fromDateTimes(date, endDate));
          }
        }}
      />
      <Component
        label='Bis'
        value={value.end}
        InputProps={{ className: classes.endPicker }}
        variant='inline'
        format={format.mask}
        labelFunc={labelFunc}
        ampm={false}
        fullWidth
        inputVariant='outlined'
        minDate={value.start.plus({ days: 1 })}
        onBlur={() => setTouched({ ...touched, end: true })}
        onChange={(date: DateTime | null) => {
          if (!!date && date >= value.start) {
            setTouched({ ...touched, end: true });
            setValue(Interval.fromDateTimes(value.start, date));
          }
        }}
      />
    </Box>
  );
}

export default SelectInterval;
