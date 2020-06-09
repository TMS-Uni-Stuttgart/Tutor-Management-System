import { Field, FieldProps } from 'formik';
import React, { useState } from 'react';
import CustomDatePicker, { CustomDatePickerProps } from '../../date-picker/DatePicker';

interface Props {
  name: string;
}

type PropType = Props & Omit<CustomDatePickerProps, keyof FieldProps['field']>;

function FormikDatePicker({ name, className, ...other }: PropType): JSX.Element {
  const [innerError, setInnerError] = useState<string>();

  return (
    <Field name={name}>
      {({ field, form, meta: { touched, error } }: FieldProps) => (
        <CustomDatePicker
          {...field}
          {...other}
          onChange={(date) => {
            if (date && date.isValid) {
              setInnerError(undefined);
              form.setFieldValue(field.name, date, true);
            } else {
              setInnerError('Ungültiges Datum');
            }
          }}
          helperText={!!touched && (error || innerError)}
          error={touched && (!!error || !!innerError)}
          className={className}
          inputVariant='outlined'
        />
      )}
    </Field>
  );
}

export default FormikDatePicker;
