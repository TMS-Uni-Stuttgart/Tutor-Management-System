import Axios from 'axios';
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

const RECONNECT_DELAY_MS = 5000;
let eventSource: EventSource | null = null;

/**
 * Starts listening for session expiration events from the backend.
 */
function startSessionListener() {
  if (eventSource) {
    eventSource.close();
  }

  eventSource = new EventSource('/api/auth/session-status');

  eventSource.onmessage = (event) => {
    if (!eventSource) return;

    const data = JSON.parse(event.data);
    if (data.status === 'expired') {
      handleSessionExpired();
    }
  };

  eventSource.onerror = () => {
    console.error('Session event connection lost, attempting to reconnect...');
    if (eventSource) {
      eventSource.close();
    }
    eventSource = null;
    setTimeout(startSessionListener, RECONNECT_DELAY_MS);
  };
}

/**
 * Handles session expiration by showing the relogin dialog.
 */
function handleSessionExpired() {
  const dialog = getDialogOutsideContext();
  dialog.show({
    title: 'Erneut anmelden',
    content: <RelogForm />,
    DialogProps: {
      disableEscapeKeyDown: true,
      onClose: (reason) => {
        if (reason === 'backdropClick') {
          return;
        }
      },
    },
  });
}

startSessionListener();

function validateStatus(status: number): boolean {
  if (status === 401) {
    handleSessionExpired();

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
