import { Field, FieldProps } from 'formik';
import React from 'react';
import CustomDatePicker, { CustomDatePickerProps } from '../../date-picker/DatePicker';

interface Props {
  name: string;
}

type PropType = Props & Omit<CustomDatePickerProps, keyof FieldProps['field']>;

function FormikDatePicker({ name, className, ...other }: PropType): JSX.Element {
  return (
    <Field name={name}>
      {({ field, form, meta: { touched, error } }: FieldProps) => (
        <CustomDatePicker
          {...field}
          {...other}
          onChange={(date) => {
            if (date && date.isValid) {
              form.setFieldValue(field.name, date, true);
            }
          }}
          helperText={!!touched && error}
          error={touched && !!error}
          className={className}
          inputVariant='outlined'
        />
      )}
    </Field>
  );
}

export default FormikDatePicker;
