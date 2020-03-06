import { LoggedInUser } from '../model/LoggedInUser';
import { plainToClass } from 'class-transformer';

export function saveUser(user: LoggedInUser) {
  sessionStorage.setItem('user', JSON.stringify(user));
}

export function getUser(): LoggedInUser | undefined {
  const userItem: string | null = sessionStorage.getItem('user');

  if (!userItem) {
    return undefined;
  }

  try {
    const user = plainToClass(LoggedInUser, JSON.parse(userItem));

    return user;
  } catch {
    return undefined;
  }
}

export function removeUser() {
  sessionStorage.removeItem('user');
}
