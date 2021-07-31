import { Role } from 'shared/model/Role';
import { User } from '../../src/database/entities/user.entity';
import { MOCKED_USERS } from '../mocks/entities.mock';

type HasId = { id: string };

export function sortListById<T extends HasId>(list: T[]): T[] {
    return list.sort((a, b) => a.id.localeCompare(b.id));
}

export function getUserWithRole(role: Role): User {
    const user = MOCKED_USERS.find((user) => user.roles.includes(role));

    if (!user) {
        throw new Error(`There is no mocked user with the ${role} role.`);
    }

    return user;
}

export function getAllUsersWithRole(role: Role): User[] {
    return MOCKED_USERS.filter((user) => user.roles.includes(role));
}
