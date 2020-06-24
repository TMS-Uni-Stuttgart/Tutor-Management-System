import { Box } from '@material-ui/core';
import { Formik, useFormikContext } from 'formik';
import { useSnackbar } from 'notistack';
import React, { useEffect, useMemo } from 'react';
import { useHistory } from 'react-router';
import { Role } from '../../../../../server/src/shared/model/Role';
import { ICreateUserDTO } from '../../../../../server/src/shared/model/User';
import FormikDebugDisplay from '../../../components/forms/components/FormikDebugDisplay';
import {
  generateTemporaryPassword,
  generateUsernameFromName,
} from '../../../components/forms/UserForm';
import { useStepper } from '../../../components/stepper-with-buttons/context/StepperContext';
import { createManyUsers } from '../../../hooks/fetching/User';
import { RoutingPath } from '../../../routes/Routing.routes';
import { useImportDataContext } from '../ImportUsers.context';
import UserDataBox from './components/UserDataBox';
import { convertCSVDataToFormData } from './components/UserDataBox.helpers';
import { FormikSubmitCallback } from '../../../types';

export interface UserFormStateValue {
  rowNr: number;
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
  [id: string]: UserFormStateValue;
}

function convertValuesToDTOS(values: UserFormState): ICreateUserDTO[] {
  return Object.values(values).map(({ rowNr, username, password, ...user }) => ({
    ...user,
    username:
      username || generateUsernameFromName({ firstname: user.firstname, lastname: user.lastname }),
    password: password || generateTemporaryPassword(),
  }));
}

function AdjustImportedUserDataFormContent(): JSX.Element {
  const { setNextCallback, removeNextCallback } = useStepper();
  const { values, isValid, validateForm, submitForm } = useFormikContext<UserFormState>();
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();

  useEffect(() => {
    setNextCallback(async () => {
      const errors = await validateForm();

      if (Object.entries(errors).length > 0) {
        enqueueSnackbar('Nutzerdaten sind ungültig.', { variant: 'error' });
        return { goToNext: false, error: true };
      }

      await submitForm();

      return { goToNext: true, runAfterFinished: () => history.push(RoutingPath.MANAGE_USERS) };
    });

    return () => removeNextCallback();
  }, [
    setNextCallback,
    removeNextCallback,
    isValid,
    values,
    enqueueSnackbar,
    history,
    submitForm,
    validateForm,
  ]);

  return (
    <Box display='flex' flex={1}>
      <UserDataBox />

      <FormikDebugDisplay showErrors />
    </Box>
  );
}

function AdjustImportedUserDataForm(): JSX.Element {
  const { data, mappedColumns } = useImportDataContext();
  const { enqueueSnackbar } = useSnackbar();

  const initialValues: UserFormState = useMemo(
    () => convertCSVDataToFormData(data, mappedColumns),
    [data, mappedColumns]
  );

  const handleSubmit: FormikSubmitCallback<UserFormState> = async (values) => {
    const dtos: ICreateUserDTO[] = convertValuesToDTOS(values);
    const createdUsers = await createManyUsers(dtos);

    enqueueSnackbar(`${createdUsers.length} Nutzer wurden erstellt.`, { variant: 'success' });
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      <AdjustImportedUserDataFormContent />
    </Formik>
  );
}

export default AdjustImportedUserDataForm;
