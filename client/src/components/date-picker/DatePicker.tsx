import { TextField, TextFieldProps } from '@mui/material';
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers';
import { DateTime, DateTimeFormatOptions } from 'luxon';

const DATE_FORMAT: DateTimeFormatOptions = {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
};

export type CustomDatePickerProps = DatePickerProps<DateTime> & {
  required?: boolean;
};
function CustomDatePicker({ required, ...props }: CustomDatePickerProps): JSX.Element {
  return (
    <DatePicker
      format='dd.MM.yyyy'
      slots={{
        textField: TextField, // Specify TextField as the component to use
      }}
      slotProps={{
        textField: {
          variant: 'outlined',
          fullWidth: true,
          required: required,
        } as TextFieldProps, // Pass any specific props you want to TextField
      }}
      {...props}
    />
  );
}

export default CustomDatePicker;
