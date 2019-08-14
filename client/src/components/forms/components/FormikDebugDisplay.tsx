import { FormikValues, FormikErrors } from 'formik';
import React from 'react';
import { isDevelopment } from '../../../util/isDevelopmentMode';

interface Props {
  values: FormikValues;
  errors?: FormikErrors<any>;
}

function FormikDebugDisplay({ values, errors }: Props): JSX.Element | null {
  if (!isDevelopment()) {
    return null;
  }

  return (
    <code style={{ gridColumn: '1', whiteSpace: 'pre' }}>
      Form values: <br />
      {JSON.stringify(values, null, 2)}
      <br />
      {errors && (
        <>
          Form errors: <br />
          {JSON.stringify(errors, null, 2)}
        </>
      )}
    </code>
  );
}

export default FormikDebugDisplay;
