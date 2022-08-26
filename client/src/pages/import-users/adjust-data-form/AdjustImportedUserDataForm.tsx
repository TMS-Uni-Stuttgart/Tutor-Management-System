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
import { useImportCSVContext } from '../../../components/import-csv/ImportCSV.context';
import Placeholder from '../../../components/Placeholder';
import {
  NextStepInformation,
  useStepper,
} from '../../../components/stepper-with-buttons/context/StepperContext';
import { getAllTutorials } from '../../../hooks/fetching/Tutorial';
import { createManyUsers } from '../../../hooks/fetching/User';
import { useCustomSnackbar } from '../../../hooks/snackbar/useCustomSnackbar';
import { useFetchState } from '../../../hooks/useFetchState';
import { Tutorial } from '../../../model/Tutorial';
import { FormikSubmitCallback } from '../../../types';
import { UserColumns } from '../ImportUsers';
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
    setNextCallback(
      async (): Promise<NextStepInformation> => {
        const errors = await validateForm();

        if (Object.entries(errors).length > 0) {
          enqueueSnackbar('Nutzerdaten sind ungültig.', { variant: 'error' });
          return { goToNext: false, error: true };
        }

        const isSuccess: any = await submitForm();

        if (!!isSuccess) {
          return { goToNext: true };
        } else {
          return { goToNext: false, error: true };
        }
      }
    );

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
  const {
    csvData,
    mapColumnsHelpers: { mappedColumns },
  } = useImportCSVContext<UserColumns, string>();
  const { enqueueSnackbar, enqueueSnackbarWithList } = useCustomSnackbar();
  const [tutorials, isLoading] = useFetchState({
    fetchFunction: getAllTutorials,
    immediate: true,
    params: [],
  });

  const initialValues: UserFormState = useMemo(() => {
    return convertCSVDataToFormData({
      data: csvData,
      values: mappedColumns,
      tutorials: tutorials ?? [],
    });
  }, [csvData, mappedColumns, tutorials]);

  const handleSubmit: FormikSubmitCallback<UserFormState> = async (values) => {
    const dtos: ICreateUserDTO[] = convertValuesToDTOS(values);

    try {
      const response: IUser[] = await createManyUsers(dtos);

      enqueueSnackbar(`${response.length} Nutzer/innen wurden erstellt.`, {
        variant: 'success',
      });
      return true;
    } catch (errors) {
      if (Array.isArray(errors)) {
        enqueueSnackbarWithList({
          title: 'Nutzer/innen konnten nicht erstellt werden.',
          textBeforeList:
            'Da bei einigen Nutzer/innen ein Fehler aufgetreten ist, wurde kein/e Nutzer/in erstellt. Folgende Nutzer/innen konnte nicht erstellt werden:',
          items: errors,
          variant: 'error',
        });
      } else {
        enqueueSnackbar(`Es konnten keine Nutzer/innen erstellt werden.`, {
          variant: 'error',
        });
      }
      return false;
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
