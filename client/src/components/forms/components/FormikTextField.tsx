import { InputAdornment, StyledComponentProps, TextField } from '@material-ui/core';
import { TextFieldProps } from '@material-ui/core/TextField';
import { Field, FieldAttributes, FieldProps } from 'formik';
import React from 'react';

interface Props {
  name: string;
  FormikFieldProps?: Omit<FieldAttributes<any>, 'name'>;
  isPercentage?: boolean;
  disableSelectAllOnFocus?: boolean;
}

type OutlineTextFieldClassKeys = 'root' | 'notchedOutline';

export type FormikTextFieldProps = Props &
  TextFieldProps &
  StyledComponentProps<OutlineTextFieldClassKeys>;

function FormikTextField({
  name,
  children,
  isPercentage,
  FormikFieldProps,
  helperText,
  InputProps,
  disableSelectAllOnFocus,
  onChange,
  ...textfieldProps
}: FormikTextFieldProps): JSX.Element {
  function getValue(fieldValue: any): any {
    if (isPercentage) {
      const value = Math.floor(fieldValue * 100 * 10) / 10;

      return Number.isNaN(value) ? '' : value;
    }

    return fieldValue;
  }

  function handleFocus(event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (!disableSelectAllOnFocus) {
      event.target.select();
    }
  }

  return (
    <Field {...FormikFieldProps} name={name}>
      {({ field, form, meta: { error, touched } }: FieldProps) => (
        <TextField
          fullWidth
          InputProps={{
            endAdornment: isPercentage ? <InputAdornment position='end'>%</InputAdornment> : null,
            ...InputProps,
          }}
          {...textfieldProps}
          {...field}
          variant='outlined'
          value={getValue(field.value)}
          onChange={(e) => {
            if (isPercentage) {
              form.setFieldValue(name, Number.parseInt(e.target.value, 10) / 100);
            } else {
              form.setFieldValue(name, e.target.value);
            }

            if (onChange && !e.isPropagationStopped) {
              onChange(e);
            }
          }}
          helperText={(!!touched && error) || helperText}
          error={touched && !!error}
          onFocus={handleFocus}
        >
          {children}
        </TextField>
      )}
    </Field>
  );
}

export default FormikTextField;
