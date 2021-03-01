import Axios from 'axios';
import React from 'react';
import LoginForm, { LoginFormState } from '../../components/forms/LoginForm';
import { FormikSubmitCallback } from '../../types';
import { getDialogOutsideContext } from '../dialog-service/DialogService';
import { useLogin } from '../LoginService';

const axios = Axios.create({
  baseURL: getApiUrl(),
  withCredentials: true,
  validateStatus: validateStatus,
});

/**
 * Returns the URL to the API server. The URL includes a route prefix if the server is configured to have one.
 *
 * @returns URL to the API server.
 */
export function getApiUrl(): string {
  const baseUrl = createBaseURL();
  const apiUrl = baseUrl + '/api';

  // Replace all doubles slashes with single ones. However, we have to restore the '://' after the protocol.
  return apiUrl.replace('//', '/').replace(':/', '://');
}

function createBaseURL(): string {
  const url: URL = new URL(window.location.href);
  const host: string = url.origin;

  // The first check is needed bc ROUTE_PREFIX will not exist in development environments
  if (typeof ROUTE_PREFIX !== 'undefined' && !!ROUTE_PREFIX) {
    return `${host}/${ROUTE_PREFIX}`;
  } else {
    return `${host}`;
  }
}

function validateStatus(status: number): boolean {
  const dialog = getDialogOutsideContext();

  if (status === 401) {
    dialog.show({
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
