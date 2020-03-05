import { AxiosResponse } from 'axios';
import React, { useContext, useState } from 'react';
import { ILoggedInUser } from 'shared/model/User';
import { transformLoggedInUserResponse } from '../util/axiosTransforms';
import { getUser, removeUser, saveUser } from '../util/userStorage';
import axios from './fetching/Axios';

export type LoggedInFunction = (isLoggedIn: boolean) => void;

interface LoginState {
  login: (username: string, password: string) => Promise<ILoggedInUser | undefined>;
  logout: () => Promise<void>;
  changePassword: (password: string) => Promise<ILoggedInUser | undefined>;
  isLoggedIn: () => boolean;
  userData: ILoggedInUser | undefined;
}

const LoginContext = React.createContext<LoginState>({
  login: () => new Promise((_, reject) => reject('Default not implemented.')),
  logout: () => new Promise((_, reject) => reject('Default not implemented.')),
  changePassword: () => new Promise((_, reject) => reject('Default not implemented.')),
  isLoggedIn: () => false,
  userData: undefined,
});

async function login(username: string, password: string): Promise<ILoggedInUser> {
  // We build the Authorization header by ourselfs because the axios library does NOT use UTF-8 to encode the string as base64.
  const encodedAuth = Buffer.from(username + ':' + password, 'utf8').toString('base64');
  const response = await axios.post<ILoggedInUser>('login', null, {
    headers: {
      Authorization: `Basic ${encodedAuth}`,
    },
    transformResponse: transformLoggedInUserResponse,
    // Override the behaviour of checking the response status to not be 401 (session timed out)
    validateStatus: () => true,
  });

  const user: ILoggedInUser = await handleResponse(response);

  if (user) {
    saveUser(user);

    return user;
  }

  return Promise.reject(response.statusText);
}

async function changePassword(password: string): Promise<ILoggedInUser | undefined> {
  const user = getUser();

  if (user === undefined || user.id === undefined) {
    return Promise.reject();
  }

  const response = await axios.post(`user/${user.id}/password`, {
    password,
  });

  if (response.status !== 204) {
    return Promise.reject();
  }

  user.hasTemporaryPassword = false;

  saveUser(user);

  return user;
}

async function logout() {
  try {
    await axios.get(`/logout`, { validateStatus: () => true });
  } catch {
  } finally {
    removeUser();
  }
}

function isLoggedIn(): boolean {
  const user = getUser();

  if (user === undefined) {
    return false;
  }

  if (user.hasTemporaryPassword) {
    return false;
  }

  return true;
}

async function handleResponse(response: AxiosResponse<ILoggedInUser>): Promise<ILoggedInUser> {
  const data = response.data;

  if (!(response.status === 200)) {
    if (response.status === 401) {
      logout();
    }

    return Promise.reject(response.statusText);
  }

  return data;
}

export function LoginContextProvider({ children }: React.PropsWithChildren<{}>) {
  const [user, setUser] = useState<ILoggedInUser | undefined>(() => {
    const user: ILoggedInUser | undefined = getUser();

    return user;
  });

  async function logUserIn(username: string, password: string) {
    const user = await login(username, password);

    setUser(user);
    return user;
  }

  async function changeUserPassword(password: string) {
    const user = await changePassword(password);

    setUser(user);
    return user;
  }

  async function logUserOut() {
    await logout();
    setUser(undefined);
  }

  const value: LoginState = {
    login: logUserIn,
    logout: logUserOut,
    changePassword: changeUserPassword,
    isLoggedIn,
    userData: user,
  };

  return <LoginContext.Provider value={value}>{children}</LoginContext.Provider>;
}

export function useLogin(): LoginState {
  return useContext(LoginContext);
}
