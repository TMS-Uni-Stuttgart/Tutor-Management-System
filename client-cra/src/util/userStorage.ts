import { plainToClass } from 'class-transformer';
import { LoggedInUser } from '../model/LoggedInUser';

export function saveUser(user: LoggedInUser): void {
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

export function removeUser(): void {
  sessionStorage.removeItem('user');
}
