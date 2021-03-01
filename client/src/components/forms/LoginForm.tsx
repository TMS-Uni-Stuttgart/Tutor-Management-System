import { Paper, Typography } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { Formik } from 'formik';
import React from 'react';
import * as Yup from 'yup';
import { FormikSubmitCallback } from '../../types';
import FormikTextField from './components/FormikTextField';
import SubmitButton from '../loading/SubmitButton';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignContent: 'space-between',
      alignItems: 'center',
    },
    formElement: {
      width: 'inherit',
      marginBottom: theme.spacing(3),
    },
    buttonContainer: {
      alignSelf: 'flex-end',
      marginTop: 'auto',
    },
    errorPaper: {
      background: theme.palette.error.dark,
      color: theme.palette.getContrastText(theme.palette.error.dark),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing(1),
      width: 'inherit',
    },
  })
);

export interface LoginFormState {
  username: string;
  password: string;
}

const initialFormState: LoginFormState = {
  username: '',
  password: '',
};

const ValidationSchema = Yup.object().shape({
  username: Yup.string().required('Benötigt'),
  password: Yup.string().required('Benötigt'),
});

interface Props extends Omit<React.ComponentProps<'form'>, 'onSubmit'> {
  onSubmit: FormikSubmitCallback<LoginFormState>;
  error?: string;
}

function LoginForm({ onSubmit, className, error, ...others }: Props): JSX.Element {
  const classes = useStyles();

  return (
    <Formik
      initialValues={initialFormState}
      onSubmit={onSubmit}
      validationSchema={ValidationSchema}
    >
      {({ handleSubmit, isSubmitting, isValid }) => (
        <form onSubmit={handleSubmit} {...others} className={clsx(className, classes.root)}>
          <FormikTextField
            name='username'
            label='Nutzername'
            className={classes.formElement}
            variant='outlined'
            autoFocus
          />

          <FormikTextField
            name='password'
            label='Passwort'
            type='password'
            variant='outlined'
            className={classes.formElement}
          />

          {error && (
            <Paper className={classes.errorPaper}>
              <Typography>{error}</Typography>
            </Paper>
          )}

          <div className={classes.buttonContainer}>
            <SubmitButton
              isSubmitting={isSubmitting}
              color='primary'
              variant='contained'
              disabled={isSubmitting || !isValid}
            >
              Login
            </SubmitButton>
          </div>
        </form>
      )}
    </Formik>
  );
}

export default LoginForm;
