import { Box, BoxProps } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import {
  DatePicker,
  TimePicker,
  DatePickerProps,
  TimePickerProps,
  KeyboardTimePicker,
} from '@material-ui/pickers';
import { DateTime, Interval, DurationObject } from 'luxon';
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

function getFormatForMode(mode: SelectIntervalMode): string {
  switch (mode) {
    case SelectIntervalMode.DATE:
      return 'EEE, dd MMMM yyyy';
    case SelectIntervalMode.TIME:
      return 'HH:mm';
    default:
      return 'EEE, dd MMMM yyyy';
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

  return (
    <Box display='flex' {...props}>
      <Component
        label='Von'
        value={value.start}
        variant='inline'
        format={format}
        ampm={false}
        fullWidth
        inputVariant='outlined'
        InputProps={{ className: classes.startPicker }}
        onBlur={() => setTouched({ ...touched, start: true })}
        onChange={(date) => {
          if (!!date && date.isValid) {
            let endDate: DateTime;
            const durationToAdd = getDurationToAdd(mode, autoIncreaseStep);

            if (date <= value.end) {
              endDate = touched.end ? value.end : date.plus(durationToAdd);
            } else {
              endDate = date.plus(durationToAdd);
              setTouched({ ...touched, end: false });
            }

            setValue(Interval.fromDateTimes(date, endDate));
          }
        }}
      />
      <Component
        label='Bis'
        value={value.end}
        InputProps={{ className: classes.endPicker }}
        variant='inline'
        format={format}
        ampm={false}
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
