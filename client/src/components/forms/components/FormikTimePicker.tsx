import { TimePicker, TimePickerProps } from '@material-ui/pickers';
import { Field, FieldProps } from 'formik';
import React from 'react';

interface Props extends Omit<TimePickerProps, keyof FieldProps['field']> {
  name: string;
  onChange?: TimePickerProps['onChange'];
}

function FormikTimePicker({ name, onChange, ...other }: Props): JSX.Element {
  return (
    <Field name={name}>
      {({ field, form, ...otherFieldProps }: FieldProps) => (
        // <div className={className}>
        <TimePicker
          variant='inline'
          autoOk
          ampm={false}
          format='HH:mm'
          fullWidth
          {...field}
          {...other}
          helperText={!!form.touched[field.name] && form.errors[field.name]}
          error={Boolean(form.touched[field.name]) && Boolean(form.errors[field.name])}
          onChange={time => {
            form.setFieldValue(field.name, time, true);

            if (onChange) {
              onChange(time);
            }
          }}
          inputVariant='outlined'
          {...otherFieldProps}
        />
        // </div>
      )}
    </Field>
  );
}

export default FormikTimePicker;
