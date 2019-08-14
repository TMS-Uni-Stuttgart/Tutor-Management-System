import { DatePicker, DatePickerProps } from '@material-ui/pickers';
import { Field, FieldProps } from 'formik';
import React from 'react';

interface Props {
  name: string;
}

type PropType = Props & Omit<DatePickerProps, keyof FieldProps['field']>;

function FormikDatePicker({ name, className, ...other }: PropType): JSX.Element {
  return (
    <Field name={name}>
      {({ field, form, ...otherFieldProps }: FieldProps) => (
        <DatePicker
          variant='inline'
          format='EE, dd MMMM yyyy'
          autoOk
          fullWidth
          {...field}
          {...other}
          onChange={date => form.setFieldValue(field.name, date, true)}
          helperText={!!form.touched[field.name] && form.errors[field.name]}
          error={Boolean(form.touched[field.name]) && Boolean(form.errors[field.name])}
          className={className}
          inputVariant='outlined'
          {...otherFieldProps}
        />
      )}
    </Field>
  );
}

export default FormikDatePicker;
