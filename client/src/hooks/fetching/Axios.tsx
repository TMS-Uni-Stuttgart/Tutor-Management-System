import React from 'react';
import Axios from 'axios';
import { showDialogOutsideContext } from '../DialogService';
import { useLogin } from '../LoginService';
import LoginForm, { LoginFormState } from '../../components/forms/LoginForm';
import { FormikSubmitCallback } from '../../types';

const axios = Axios.create({
  baseURL: createBaseURL() + '/api',
  withCredentials: true,
  headers: {
    // This header prevents the spring backend to add a header which will make a popup appear if the credentials are wrong.
    'X-Requested-With': 'XMLHttpRequest',
  },
  validateStatus: validateStatus,
});

function createBaseURL() {
  const url: URL = new URL(window.location.href);
  return `${url.origin}`;
}

function validateStatus(status: number): boolean {
  if (status === 401) {
    showDialogOutsideContext({
      title: 'Erneut anmelden',
      content: <RelogForm />,
      DialogProps: {
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
      },
    });

    return false;
  }

  return true;
}

function RelogForm(): JSX.Element {
  const { login } = useLogin();

  const onSubmit: FormikSubmitCallback<LoginFormState> = async (
    { username, password },
    { setSubmitting }
  ) => {
    try {
      const userData = await login(username, password);
      if (userData && !userData.hasTemporaryPassword) {
        window.location.reload();
      }
    } catch (reason) {
      setSubmitting(false);
    }
  };

  return <LoginForm onSubmit={onSubmit} />;
}

export default axios;
