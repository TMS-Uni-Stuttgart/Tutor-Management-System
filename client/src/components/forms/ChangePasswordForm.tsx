import React, { useState } from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Formik } from 'formik';
import { Paper, Typography, Button } from '@material-ui/core';
import FormikTextField from './components/FormikTextField';
import SubmitButton from '../loading/SubmitButton';
import * as Yup from 'yup';
import { FormikSubmitCallback } from '../../types';
import clsx from 'clsx';
import { passwordValidationSchema } from '../../util/validationSchemas';

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
      padding: theme.spacing(1),
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
    submitButton: {
      marginLeft: theme.spacing(2),
    },
  })
);

export interface ChangePasswordFormState {
  password: string;
  repeatedPassword: string;
}

interface Props extends Omit<React.ComponentProps<'form'>, 'onSubmit' | 'onChange'> {
  onSubmit: FormikSubmitCallback<ChangePasswordFormState>;
  onCancel: () => void;
}

const ValidationSchema = Yup.object().shape({
  password: passwordValidationSchema,
  repeatedPassword: Yup.string().required('Benötigt'),
});

const initialFormState: ChangePasswordFormState = {
  password: '',
  repeatedPassword: '',
};

function ChangePasswordForm({ onSubmit, onCancel, className, ...other }: Props): JSX.Element {
  const classes = useStyles();
  const [error, setError] = useState('');

  const onFormSubmit: FormikSubmitCallback<ChangePasswordFormState> = async (values, actions) => {
    const { password, repeatedPassword } = values;

    if (password.includes(':')) {
      setError('Passwörter dürfen keinen Doppelpunkt enthalten.');
      actions.setSubmitting(false);
      return;
    }

    if (password !== repeatedPassword) {
      setError('Passwörter stimmen nicht überein.');
      actions.setSubmitting(false);
      return;
    }

    onSubmit(values, actions);
  };

  return (
    <Formik
      initialValues={initialFormState}
      onSubmit={onFormSubmit}
      validationSchema={ValidationSchema}
    >
      {({ handleSubmit, isSubmitting, isValid }) => (
        <form
          onChange={() => setError('')}
          onSubmit={handleSubmit}
          {...other}
          className={clsx(className, classes.root)}
        >
          <FormikTextField
            name='password'
            label='Passwort'
            type='password'
            variant='outlined'
            className={classes.formElement}
            autoFocus
          />

          <FormikTextField
            name='repeatedPassword'
            label='Passwort wiederholen'
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
            <Button variant='outlined' onClick={onCancel} disabled={isSubmitting}>
              Abbrechen
            </Button>
            <SubmitButton
              isSubmitting={isSubmitting}
              variant='outlined'
              color='primary'
              disabled={isSubmitting || !isValid}
              className={classes.submitButton}
            >
              Passwort ändern
            </SubmitButton>
          </div>
        </form>
      )}
    </Formik>
  );
}

export default ChangePasswordForm;
