import { Box } from '@material-ui/core';
import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { Role } from '../../../../../server/src/shared/model/Role';
import FormikDebugDisplay from '../../../components/forms/components/FormikDebugDisplay';
import {
  NextStepInformation,
  useStepper,
} from '../../../components/stepper-with-buttons/context/StepperContext';
import UserDataBox from './components/UserDataBox';

export interface UserFormStateValue {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  roles: Role[];
  tutorials: string[];
  tutorialsToCorrect: string[];
  username?: string;
  password?: string;
}

export interface UserFormState {
  [id: number]: UserFormStateValue;
}

function NO_OP() {
  /* No-Op */
}

function AdjustImportedUserDataForm(): JSX.Element {
  const { setNextCallback, removeNextCallback } = useStepper();
  const [timesTried, setTimesTried] = useState(0);

  const initialValues: UserFormState = {};

  useEffect(() => {
    console.log('ImportUsers - registering next callback');
    const callback = () => {
      // TODO: Implement correct next callback!
      console.log('Other next clicked');
      return new Promise<NextStepInformation>((resolve) => {
        setTimeout(() => {
          if (timesTried === 0) {
            setTimesTried(1);
            resolve({ goToNext: false, error: true });
          } else {
            setTimesTried(0);
            resolve({ goToNext: true, error: false });
          }
        }, 2000);
      });
    };

    setNextCallback(callback);

    return () => removeNextCallback();
  }, [setNextCallback, removeNextCallback, timesTried]);

  return (
    <Formik initialValues={initialValues} onSubmit={NO_OP}>
      <Box display='flex' flex={1}>
        <UserDataBox />

        <FormikDebugDisplay showErrors />
      </Box>
    </Formik>
  );
}

export default AdjustImportedUserDataForm;
