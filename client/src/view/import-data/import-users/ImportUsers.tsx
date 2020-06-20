import { Box, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';
import {
  NextStepInformation,
  useStepper,
} from '../../../components/stepper-with-buttons/context/StepperContext';
import { useImportDataContext } from '../ImportData.context';
import { Formik } from 'formik';
import FormikSelect from '../../../components/forms/components/FormikSelect';
import FormikDebugDisplay from '../../../components/forms/components/FormikDebugDisplay';
import UserDataBox from './components/UserDataBox';
import { Role } from '../../../../../server/src/shared/model/Role';

const useStyles = makeStyles((theme) =>
  createStyles({
    select: {
      minWidth: 210,
      marginTop: theme.spacing(2),
    },
  })
);

export interface FormState {
  firstnameColumn: string;
  lastnameColumn: string;
  emailColumn: string;
  rolesColumn: string;
  usernameColumn: string;
  passwordColumn: string;
  users: UserFormState;
}

export interface UserFormStateValue {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  roles: Role[];
  username?: string;
  password?: string;
}

export interface UserFormState {
  [id: number]: UserFormStateValue;
}

const initialValues: FormState = {
  firstnameColumn: '',
  lastnameColumn: '',
  emailColumn: '',
  rolesColumn: '',
  usernameColumn: '',
  passwordColumn: '',
  users: {},
};

function NO_OP() {
  /* No-Op */
}

function ImportUsers(): JSX.Element {
  const classes = useStyles();

  const { setNextCallback, removeNextCallback } = useStepper();
  const [timesTried, setTimesTried] = useState(0);
  const {
    data: { headers },
  } = useImportDataContext();

  useEffect(() => {
    console.log('ImportUsers - registering next callback');
    const callback = () => {
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
        <Box display='flex' flexDirection='column' padding={1}>
          <Typography>Spalten zuordnen</Typography>

          <FormikSelect
            name='firstnameColumn'
            label='Vorname'
            required
            items={headers}
            itemToValue={(i) => i}
            itemToString={(i) => i}
            emptyPlaceholder='Keine Überschriften verfügbar'
            className={classes.select}
          />

          <FormikSelect
            name='lastnameColumn'
            label='Nachname'
            required
            items={headers}
            itemToValue={(i) => i}
            itemToString={(i) => i}
            emptyPlaceholder='Keine Überschriften verfügbar'
            className={classes.select}
          />

          <FormikSelect
            name='emailColumn'
            label='E-Mailadresse'
            required
            items={headers}
            itemToValue={(i) => i}
            itemToString={(i) => i}
            emptyPlaceholder='Keine Überschriften verfügbar'
            className={classes.select}
          />

          <FormikSelect
            name='rolesColumn'
            label='Rollen'
            nameOfNoneItem='Keine Spalte auswählen'
            items={headers}
            itemToValue={(i) => i}
            itemToString={(i) => i}
            emptyPlaceholder='Keine Überschriften verfügbar'
            className={classes.select}
          />

          <FormikSelect
            name='usernameColumn'
            label='Nutzername'
            nameOfNoneItem='Keine Spalte auswählen'
            items={headers}
            itemToValue={(i) => i}
            itemToString={(i) => i}
            emptyPlaceholder='Keine Überschriften verfügbar'
            className={classes.select}
          />

          <FormikSelect
            name='passwordColumn'
            label='Passwort'
            nameOfNoneItem='Keine Spalte auswählen'
            items={headers}
            itemToValue={(i) => i}
            itemToString={(i) => i}
            emptyPlaceholder='Keine Überschriften verfügbar'
            className={classes.select}
          />

          <FormikDebugDisplay />
        </Box>

        <UserDataBox name='users' />
      </Box>
    </Formik>
  );
}

export default ImportUsers;
