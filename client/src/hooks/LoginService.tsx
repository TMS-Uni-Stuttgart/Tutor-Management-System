import { AxiosResponse } from 'axios';
import { plainToClass } from 'class-transformer';
import React, { useContext, useState } from 'react';
import { ILoggedInUser } from 'shared/model/User';
import { LoggedInUser } from '../model/LoggedInUser';
import { RequireChildrenProp } from '../typings/RequireChildrenProp';
import { getUser, removeUser, saveUser } from '../util/userStorage';
import axios from './fetching/Axios';

interface LoginState {
  login: (username: string, password: string) => Promise<LoggedInUser | undefined>;
  logout: () => Promise<void>;
  changePassword: (password: string) => Promise<LoggedInUser | undefined>;
  isLoggedIn: () => boolean;
  userData: LoggedInUser | undefined;
}

const LoginContext = React.createContext<LoginState>({
  login: () => new Promise((_, reject) => reject('Default not implemented.')),
  logout: () => new Promise((_, reject) => reject('Default not implemented.')),
  changePassword: () => new Promise((_, reject) => reject('Default not implemented.')),
  isLoggedIn: () => false,
  userData: undefined,
});

async function login(username: string, password: string): Promise<LoggedInUser> {
  const response = await axios.post<ILoggedInUser>(
    'auth/login',
    { username, password },
    {
      validateStatus: () => true,
    }
  );

  const user: LoggedInUser = await handleResponse(response);

  if (user) {
    saveUser(user);

    return user;
  }

  return Promise.reject(response.statusText);
}

async function changePassword(password: string): Promise<LoggedInUser | undefined> {
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
    await axios.get(`auth/logout`, { validateStatus: () => true });
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

async function handleResponse(response: AxiosResponse<ILoggedInUser>): Promise<LoggedInUser> {
  const data = response.data;

  if (!(response.status === 200)) {
    if (response.status === 401) {
      logout();
    }

    return Promise.reject(response.statusText);
  }

  return plainToClass(LoggedInUser, data);
}

export function LoginContextProvider({ children }: RequireChildrenProp): JSX.Element {
  const [user, setUser] = useState<LoggedInUser | undefined>(() => {
    const user: LoggedInUser | undefined = getUser();

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

export function useLoggedInUser(): LoggedInUser {
  const { userData } = useContext(LoginContext);

  if (!userData) {
    throw new Error('No logged in user available.');
  }

  return userData;
}
