import { transformLoggedInUserResponse } from './axiosTransforms';
import { LoggedInUser } from 'shared/dist/model/User';

export function saveUser(user: LoggedInUser) {
  sessionStorage.setItem('user', JSON.stringify(user));
}

export function getUser(): LoggedInUser | undefined {
  const userItem: string | null = sessionStorage.getItem('user');

  if (!userItem) {
    return undefined;
  }

  const user: LoggedInUser = transformLoggedInUserResponse(userItem);

  return user;
}

export function removeUser() {
  sessionStorage.removeItem('user');
}
