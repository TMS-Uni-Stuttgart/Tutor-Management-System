import { Field, FieldProps } from 'formik';
import React from 'react';
import CustomSelect, { CustomSelectProps } from '../../CustomSelect';

interface Props<T> extends CustomSelectProps<T> {
  name: string;
}

function FormikSelect<T>({ onChange, name, ...other }: Props<T>): JSX.Element {
  return (
    <Field name={name}>
      {({ field, form }: FieldProps) => (
        <CustomSelect
          {...other}
          {...field}
          onChange={onChange ? onChange : field.onChange}
          helperText={!!form.touched[field.name] && form.errors[field.name]}
          error={Boolean(form.touched[field.name]) && Boolean(form.errors[field.name])}
        />
      )}
    </Field>
  );
}

export default FormikSelect;
