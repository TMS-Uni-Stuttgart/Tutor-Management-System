import React from 'react';
import { KeyboardDatePicker, KeyboardDatePickerProps } from '@material-ui/pickers';
import { DateTimeFormatOptions, DateTime } from 'luxon';

const DATE_FORMAT: DateTimeFormatOptions = {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
};

export type CustomDatePickerProps = KeyboardDatePickerProps;

function CustomDatePicker(props: CustomDatePickerProps): JSX.Element {
  const labelFunc = (date: DateTime | null, invalidLabel: string) => {
    if (!date || !date.isValid) {
      return invalidLabel;
    }

    return date.toLocaleString(DATE_FORMAT);
  };

  return (
    <KeyboardDatePicker
      variant='inline'
      format='dd.MM.yyyy'
      labelFunc={labelFunc}
      fullWidth
      inputVariant='outlined'
      {...props}
    />
  );
}

export default CustomDatePicker;
