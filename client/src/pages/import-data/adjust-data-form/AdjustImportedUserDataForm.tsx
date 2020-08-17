import { Box } from '@material-ui/core';
import { Formik, useFormikContext } from 'formik';
import { useSnackbar } from 'notistack';
import React, { useEffect, useMemo } from 'react';
import { useHistory } from 'react-router';
import { Role } from 'shared/model/Role';
import { ICreateUserDTO, IUser } from 'shared/model/User';
import FormikDebugDisplay from '../../../components/forms/components/FormikDebugDisplay';
import {
  generateTemporaryPassword,
  generateUsernameFromName,
} from '../../../components/forms/UserForm';
import { useMapColumnsHelpers } from '../../../components/import-csv/hooks/useMapColumnsHelpers';
import Placeholder from '../../../components/Placeholder';
import { useStepper } from '../../../components/stepper-with-buttons/context/StepperContext';
import { getAllTutorials } from '../../../hooks/fetching/Tutorial';
import { createManyUsers } from '../../../hooks/fetching/User';
import { useCustomSnackbar } from '../../../hooks/snackbar/useCustomSnackbar';
import { useFetchState } from '../../../hooks/useFetchState';
import { Tutorial } from '../../../model/Tutorial';
import { ROUTES } from '../../../routes/Routing.routes';
import { FormikSubmitCallback } from '../../../types';
import UserDataBox from './components/UserDataBox';
import { convertCSVDataToFormData } from './components/UserDataBox.helpers';

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

interface Props {
  tutorials: Tutorial[];
}

function convertValuesToDTOS(values: UserFormState): ICreateUserDTO[] {
  return Object.values(values).map(({ rowNr, username, password, ...user }) => ({
    ...user,
    username:
      username || generateUsernameFromName({ firstname: user.firstname, lastname: user.lastname }),
    password: password || generateTemporaryPassword(),
  }));
}

function AdjustImportedUserDataFormContent({ tutorials }: Props): JSX.Element {
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

      return {
        goToNext: true,
        runAfterFinished: () => history.push(ROUTES.MANAGE_USERS.create({})),
      };
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
      <UserDataBox tutorials={tutorials} />

      <FormikDebugDisplay showErrors />
    </Box>
  );
}

function AdjustImportedUserDataForm(): JSX.Element {
  const { data, mappedColumns } = useMapColumnsHelpers();
  const { enqueueSnackbar } = useCustomSnackbar();
  const { isLoading, value: tutorials } = useFetchState({
    fetchFunction: getAllTutorials,
    immediate: true,
    params: [],
  });

  const initialValues: UserFormState = useMemo(() => {
    return convertCSVDataToFormData({ data, values: mappedColumns, tutorials: tutorials ?? [] });
  }, [data, mappedColumns, tutorials]);

  const handleSubmit: FormikSubmitCallback<UserFormState> = async (values) => {
    try {
      const dtos: ICreateUserDTO[] = convertValuesToDTOS(values);
      const response: IUser[] = await createManyUsers(dtos);

      enqueueSnackbar(`${response.length} Nutzer/innen wurden erstellt.`, {
        variant: 'success',
      });
    } catch (err) {
      // TODO: Parse error message and show SnackbarWithList -- create a new type like "RequestError".
      enqueueSnackbar(`Es konnten keine Nutzer/innen erstellt werden.`, { variant: 'error' });
    }
  };

  return (
    <Placeholder
      showPlaceholder={!tutorials}
      placeholderText='Tutorien konnten nicht geladen werden'
      loading={isLoading}
    >
      {tutorials && (
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          <AdjustImportedUserDataFormContent tutorials={tutorials} />
        </Formik>
      )}
    </Placeholder>
  );
}

export default AdjustImportedUserDataForm;
