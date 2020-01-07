import { Paper, Theme, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import ChangePasswordForm, {
  ChangePasswordFormState,
} from '../components/forms/ChangePasswordForm';
import LoginForm, { LoginFormState } from '../components/forms/LoginForm';
import { useLogin } from '../hooks/LoginService';
import { FormikSubmitCallback } from '../types';
import { PATH_REDIRECT_AFTER_LOGIN } from '../util/routing/Routing.routes';
import { Information as InfoIcon } from 'mdi-material-ui';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    paper: {
      display: 'flex',
      flexDirection: 'column',
      padding: theme.spacing(2),
      minWidth: '50%',
      minHeight: '50%',
      maxWidth: '75%',
    },
    formTitle: {
      marginBottom: theme.spacing(3),
    },
    loginForm: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignContent: 'space-between',
    },
    changePwInfoPaper: {
      border: `2px solid ${theme.palette.secondary.light}`,
      padding: theme.spacing(1.5),
      margin: theme.spacing(0, 1, 2, 1),
      display: 'flex',
    },
    infoIcon: {
      marginRight: theme.spacing(1),
    },
  })
);

function Login({ enqueueSnackbar }: WithSnackbarProps): JSX.Element {
  const classes = useStyles();
  const [error, setError] = useState('');
  const { isLoggedIn, login, logout, userData, changePassword } = useLogin();

  if (isLoggedIn()) {
    return <Redirect to={PATH_REDIRECT_AFTER_LOGIN} />;
  }

  const onTemporaryPasswordChangeSubmit: FormikSubmitCallback<ChangePasswordFormState> = async (
    { password },
    { setSubmitting }
  ) => {
    try {
      await changePassword(password);
      enqueueSnackbar('Passwort erfolgreich geändert.', { variant: 'success' });
    } catch {
      setSubmitting(false);
    }
  };

  const onSubmit: FormikSubmitCallback<LoginFormState> = async (
    { username, password },
    { setSubmitting }
  ) => {
    try {
      const userData = await login(username, password);

      if (userData && !userData.hasTemporaryPassword) {
        enqueueSnackbar('Erfolgreich eingeloggt', { variant: 'success' });
      }
    } catch (reason) {
      if (reason === 'Network Error') {
        setError('Der Loginserver ist aktuell nicht erreichbar.');
      } else if (reason === 'Unauthorized') {
        setError('Nutzername und Passwort stimmen nicht überein.');
      } else {
        setError('Ein unbekannter Fehler ist aufgetreten.');
      }

      setSubmitting(false);
    }
  };

  const showPasswordChangeForm: boolean = !!userData && !!userData.hasTemporaryPassword;

  return (
    <div className={classes.root}>
      <Paper elevation={8} className={classes.paper}>
        <Typography variant='h6' className={classes.formTitle}>
          {showPasswordChangeForm ? 'Passwort ändern' : 'Login'}
        </Typography>

        {showPasswordChangeForm ? (
          <>
            <Paper className={classes.changePwInfoPaper} elevation={0}>
              <InfoIcon className={classes.infoIcon} color='secondary' />

              <Typography noWrap={false}>
                Aus Sicherheitsgründen muss das initial vergebene Passwort geändert werden, bevor
                fortgefahren werden kann.
              </Typography>
            </Paper>

            <ChangePasswordForm
              onSubmit={onTemporaryPasswordChangeSubmit}
              onCancel={() => logout()}
              className={classes.loginForm}
            />
          </>
        ) : (
          <LoginForm onSubmit={onSubmit} className={classes.loginForm} error={error} />
        )}
      </Paper>
    </div>
  );
}

export default withSnackbar(Login);
