import { TimePicker, TimePickerProps } from '@mui/x-date-pickers';
import { Field, FieldProps } from 'formik';
import { DateTime } from 'luxon';

interface Props extends Omit<TimePickerProps<DateTime>, keyof FieldProps['field']> {
  name: string;
  required?: boolean;
  onChange?: TimePickerProps<DateTime>['onChange'];
}

function FormikTimePicker({ name, required, onChange, ...other }: Props): JSX.Element {
  return (
    <Field name={name}>
      {({ field, form, meta: { touched, error } }: FieldProps) => {
        const dateValue = field.value ? DateTime.fromISO(field.value) : null;

        return (
          <TimePicker
            ampm={false}
            format='HH:mm'
            slotProps={{
              textField: {
                variant: 'outlined',
                fullWidth: true,
                helperText: !!touched && error ? error : '',
                error: !!touched && !!error,
                required,
              },
            }}
            {...field}
            {...other}
            value={dateValue}
            onChange={(time, context) => {
              form.setFieldValue(field.name, time, true);

              if (onChange) {
                onChange(time, context);
              }
            }}
          />
        );
      }}
    </Field>
  );
}

export default FormikTimePicker;
