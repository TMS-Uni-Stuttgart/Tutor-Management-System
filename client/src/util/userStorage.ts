import { transformLoggedInUserResponse } from './axiosTransforms';
import { ILoggedInUser } from 'shared/model/User';

export function saveUser(user: ILoggedInUser) {
  sessionStorage.setItem('user', JSON.stringify(user));
}

export function getUser(): ILoggedInUser | undefined {
  const userItem: string | null = sessionStorage.getItem('user');

  if (!userItem) {
    return undefined;
  }

  const user: ILoggedInUser | undefined = transformLoggedInUserResponse(userItem);

  return user;
}

export function removeUser() {
  sessionStorage.removeItem('user');
}
