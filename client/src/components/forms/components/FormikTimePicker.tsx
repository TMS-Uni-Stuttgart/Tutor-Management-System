import { TimePicker, TimePickerProps } from '@mui/lab';
import { Field, FieldProps } from 'formik';

interface Props extends Omit<TimePickerProps, keyof FieldProps['field']> {
  name: string;
  onChange?: TimePickerProps['onChange'];
}

function FormikTimePicker({ name, onChange, ...other }: Props): JSX.Element {
  return (
    <Field name={name}>
      {({ field, form, meta: { touched, error } }: FieldProps) => (
        <TimePicker
          variant='inline'
          ampm={false}
          format='HH:mm'
          fullWidth
          {...field}
          {...other}
          helperText={!!touched && error}
          error={touched && !!error}
          onChange={(time) => {
            form.setFieldValue(field.name, time, true);

            if (onChange) {
              onChange(time);
            }
          }}
          inputVariant='outlined'
        />
      )}
    </Field>
  );
}

export default FormikTimePicker;
