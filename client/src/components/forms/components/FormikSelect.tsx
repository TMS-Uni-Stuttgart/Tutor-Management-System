import { SelectChangeEvent } from '@mui/material/Select'; // Import SelectChangeEvent
import { Field, FieldProps, FormikHandlers } from 'formik';
import React from 'react';
import CustomSelect, { CustomSelectProps } from '../../CustomSelect';

export interface FormikSelectProps<T> extends CustomSelectProps<T> {
  name: string;
}

function FormikSelect<T>({
  onChange,
  name,
  helperText,
  ...other
}: FormikSelectProps<T>): JSX.Element {
  function handleChange(formikOnChange: FormikHandlers['handleChange']) {
    return (e: SelectChangeEvent<unknown>, child: React.ReactNode) => {
      if (onChange) {
        onChange(e, child);
      }

      formikOnChange(e);
    };
  }

  return (
    <Field name={name}>
      {({ field, meta: { touched, error } }: FieldProps) => (
        <CustomSelect
          {...other}
          {...field}
          onChange={handleChange(field.onChange)}
          helperText={(!!touched && error) || helperText}
          error={touched && !!error}
        />
      )}
    </Field>
  );
}

export default FormikSelect;
