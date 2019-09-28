import { Field, FieldProps, FormikHandlers } from 'formik';
import React from 'react';
import CustomSelect, { CustomSelectProps } from '../../CustomSelect';

type ChangeEventType = React.ChangeEvent<{
  name?: string | undefined;
  value: unknown;
}>;

interface Props<T> extends CustomSelectProps<T> {
  name: string;
}

function FormikSelect<T>({ onChange, name, helperText, ...other }: Props<T>): JSX.Element {
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
      {({ field, form }: FieldProps) => (
        <CustomSelect
          {...other}
          {...field}
          onChange={handleChange(field.onChange)}
          helperText={(!!form.touched[field.name] && form.errors[field.name]) || helperText}
          error={Boolean(form.touched[field.name]) && Boolean(form.errors[field.name])}
        />
      )}
    </Field>
  );
}

export default FormikSelect;
