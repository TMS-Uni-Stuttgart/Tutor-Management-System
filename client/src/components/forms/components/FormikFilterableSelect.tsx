import { FieldArray, useField } from 'formik';
import React from 'react';
import FilterableSelect, { FilterableSelectProps } from './FilterableSelect';

interface Props<T> extends Omit<FilterableSelectProps<T>, 'value' | 'onChange'> {
  name: string;
}

function FormikFilterableSelect<T>({ name, ...props }: Props<T>): JSX.Element {
  const [, meta, { setValue }] = useField<string[]>(name);

  if (!Array.isArray(meta.value)) {
    throw new Error(
      `FormikFilterableSelect -- The values object of the Formik form should be an array at property '${name}'. This is not the case. The current type is ${typeof meta.value}`
    );
  }

  return (
    <FieldArray
      name={name}
      render={() => (
        <FilterableSelect
          {...props}
          value={meta.value}
          onChange={(newValue) => {
            setValue(newValue);
          }}
        />
      )}
    />
  );
}

export default FormikFilterableSelect;
