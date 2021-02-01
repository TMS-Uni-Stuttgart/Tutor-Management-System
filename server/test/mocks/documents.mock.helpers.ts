import { NotFoundException } from '@nestjs/common';
import { UserModel } from '../../src/database/models/user.model';
import { Role } from '../../src/shared/model/Role';
import { MockedModel } from '../helpers/testdocument';
import { USER_DOCUMENTS } from './documents.mock';

/**
 * Searches a user document with the given role which is available to the inmemory database.
 *
 * @param role Role to search.
 *
 * @returns User with the given role.
 *
 * @throws `Error` - If no user with such role could be found.
 */
export function getUserDocWithRole(role: Role): MockedModel<UserModel> {
    for (const doc of USER_DOCUMENTS) {
        if (doc.roles.includes(role)) {
            return doc;
        }
    }

    throw new NotFoundException(
        `There is no user with the '${role} role present in the USER_DOCUMENTS.'`
    );
}

/**
 * Searches and returns __all__ users with the given role available to the inmemory database.
 *
 * @param role Role to search.
 *
 * @returns All users with the specified role.
 *
 * @throws `Error` - If no user with the given role could be found.
 */
export function getAllUserDocsWithRole(role: Role): MockedModel<UserModel>[] {
    const docs: MockedModel<UserModel>[] = [];

    for (const doc of USER_DOCUMENTS) {
        if (doc.roles.includes(role)) {
            docs.push(doc);
        }
    }

    if (docs.length === 0) {
        throw new NotFoundException(
            `There is no user with the '${role} role present in the USER_DOCUMENTS.'`
        );
    }

    return docs;
}
