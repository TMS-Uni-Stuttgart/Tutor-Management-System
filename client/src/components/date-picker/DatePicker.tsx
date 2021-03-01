import { KeyboardDatePicker, KeyboardDatePickerProps } from '@material-ui/pickers';
import { DateTime, DateTimeFormatOptions } from 'luxon';
import React from 'react';

const DATE_FORMAT: DateTimeFormatOptions = {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
};

export type CustomDatePickerProps = KeyboardDatePickerProps;

function CustomDatePicker(props: CustomDatePickerProps): JSX.Element {
  const labelFunc = (date: DateTime | null, invalidLabel: string) => {
    const label = date?.toLocaleString(DATE_FORMAT);

    return !!label ? label : invalidLabel;
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
