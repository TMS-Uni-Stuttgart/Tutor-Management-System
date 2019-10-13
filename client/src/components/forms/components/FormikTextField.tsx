import { TextField, InputAdornment } from '@material-ui/core';
import { TextFieldProps } from '@material-ui/core/TextField';
import { Field, FieldProps } from 'formik';
import React from 'react';

interface Props {
  name: string;
  isPercentage?: boolean;
}

export type FormikTextFieldProps = Props & TextFieldProps;

function FormikTextField({
  name,
  children,
  isPercentage,
  ...textfieldProps
}: FormikTextFieldProps): JSX.Element {
  function getValue(fieldValue: any): any {
    if (isPercentage) {
      const value = Math.floor(fieldValue * 100 * 10) / 10;

      return Number.isNaN(value) ? '' : value;
    }

    return fieldValue;
  }

  return (
    <Field name={name}>
      {({ field, form, meta: { error, touched } }: FieldProps) => (
        <TextField
          fullWidth
          InputProps={{
            endAdornment: isPercentage ? <InputAdornment position='end'>%</InputAdornment> : null,
          }}
          {...textfieldProps}
          {...field}
          variant='outlined'
          value={getValue(field.value)}
          onChange={e => {
            if (isPercentage) {
              form.setFieldValue(name, Number.parseInt(e.target.value) / 100);
            } else {
              form.setFieldValue(name, e.target.value);
            }
          }}
          helperText={!!touched && error}
          error={touched && !!error}
          onFocus={e => e.target.select()}
        >
          {children}
        </TextField>
      )}
    </Field>
  );
}

export default FormikTextField;
