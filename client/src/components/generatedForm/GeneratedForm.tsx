import { connect, FormikProps, FormikValues } from 'formik';
import React from 'react';
import GeneratedField from './components/GeneratedField';
import { FormDataSet } from './types/FieldData';

interface Props extends FormikProps<any> {
  formData: FormDataSet;
}

function generateFormFields(formData: FormDataSet, values: FormikValues): JSX.Element {
  return (
    <>
      {Object.entries(formData).map(([name, fieldData]) => (
        <GeneratedField key={name} fieldData={fieldData} name={name} values={values} />
      ))}
    </>
  );
}

function GeneratedForm({ formData, values }: Props): JSX.Element {
  return generateFormFields(formData, values);
}

export default connect(GeneratedForm);
