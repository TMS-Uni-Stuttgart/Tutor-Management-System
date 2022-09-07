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
        return plainToClass(LoggedInUser, JSON.parse(userItem));
    } catch {
        return undefined;
    }
}

export function removeUser(): void {
    sessionStorage.removeItem('user');
}
