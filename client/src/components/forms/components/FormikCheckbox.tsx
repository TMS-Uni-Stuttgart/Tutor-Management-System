import Checkbox, { CheckboxProps } from '@material-ui/core/Checkbox';
import { Field, FieldProps } from 'formik';
import React from 'react';
import { FormControlLabel } from '@material-ui/core';

interface Props extends CheckboxProps {
  name: string;
  label: string;
}

function FormikCheckbox({ name, label, ...other }: Props): JSX.Element {
  return (
    <Field name={name}>
      {({ field }: FieldProps) => (
        <FormControlLabel
          control={<Checkbox {...other} {...field} checked={!!field.value} />}
          name={name}
          label={label}
        />
      )}
    </Field>
  );
}

export default FormikCheckbox;
