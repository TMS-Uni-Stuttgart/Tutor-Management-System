import { TextField, InputAdornment } from '@material-ui/core';
import { TextFieldProps } from '@material-ui/core/TextField';
import { Field, FieldProps } from 'formik';
import React from 'react';

interface Props {
  name: string;
  isPercentage?: boolean;
}

type PropType = Props & TextFieldProps;

function FormikTextField({
  name,
  children,
  isPercentage,
  ...textfieldProps
}: PropType): JSX.Element {
  function getValue(fieldValue: any): any {
    if (isPercentage) {
      const value = Math.floor(fieldValue * 100 * 10) / 10;

      return Number.isNaN(value) ? '' : value;
    }

    return fieldValue;
  }

  return (
    <Field name={name}>
      {({ field, form }: FieldProps) => (
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
          helperText={!!form.touched[field.name] && form.errors[field.name]}
          error={Boolean(form.touched[field.name]) && Boolean(form.errors[field.name])}
          onFocus={e => e.target.select()}
        >
          {children}
        </TextField>
      )}
    </Field>
  );
}

export default FormikTextField;
