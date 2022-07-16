import { Field, FieldProps, FormikHandlers } from 'formik';
import React from 'react';
import CustomSelect, { CustomSelectProps } from '../../CustomSelect';

type ChangeEventType = React.ChangeEvent<{
  name?: string | undefined;
  value: unknown;
}>;

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
    return (e: ChangeEventType, child: React.ReactNode) => {
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
