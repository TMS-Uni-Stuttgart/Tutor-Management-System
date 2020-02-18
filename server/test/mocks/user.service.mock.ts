import { UserModel } from '../../src/module/models/user.model';
import { Role } from '../../src/shared/model/Role';
import { generateObjectId } from '../helpers/test.helpers';
import { TestDocument } from '../helpers/testdocument';
import { NotFoundException } from '@nestjs/common';

export const USER_DOCUMENTS: readonly TestDocument<UserModel>[] = [
  {
    id: generateObjectId(),
    firstname: 'Albus',
    lastname: 'Dumbledore',
    email: 'dumbledore@hogwarts.com',
    username: 'dumbleas',
    password: 'albusPassword',
    temporaryPassword: undefined,
    roles: [Role.ADMIN],
    tutorials: [],
    tutorialsToCorrect: [],
  },
  {
    id: generateObjectId(),
    firstname: 'Harry',
    lastname: 'Potter',
    email: 'harrypotter@hogwarts.com',
    username: 'potterhy',
    password: 'harrysPassword',
    temporaryPassword: undefined,
    roles: [Role.TUTOR],
    tutorials: [],
    tutorialsToCorrect: [],
  },
  {
    id: generateObjectId(),
    firstname: 'Ron',
    lastname: 'Weasley',
    email: 'weaslyron@hogwarts.com',
    username: 'weaslern',
    password: 'ronsPassword',
    temporaryPassword: undefined,
    roles: [Role.EMPLOYEE],
    tutorials: [],
    tutorialsToCorrect: [],
  },
  {
    id: generateObjectId(),
    firstname: 'Hermine',
    lastname: 'Granger',
    email: 'granger_hermine@hogwarts.com',
    username: 'grangehe',
    password: 'herminesPassword',
    temporaryPassword: undefined,
    roles: [Role.CORRECTOR],
    tutorials: [],
    tutorialsToCorrect: [],
  },
  {
    id: generateObjectId(),
    firstname: 'Ginny',
    lastname: 'Weasley',
    email: 'weasley_ginny@hogwarts.com',
    username: 'weaslegy',
    password: 'ginnysPassword',
    temporaryPassword: undefined,
    roles: [Role.TUTOR, Role.CORRECTOR],
    tutorials: [],
    tutorialsToCorrect: [],
  },
];

export class MockedUserService {
  /**
   * Searches a user document with the given role which is available to the MockedUserService.
   *
   * @param role Role to search.
   *
   * @returns User with the given role.
   *
   * @throws `Error` - If no user with such role could be found.
   */
  static getUserDocWithRole(role: Role): TestDocument<UserModel> {
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
   * Searches and returns __all__ users with the given role available to the MockedUserService.
   *
   * @param role Role to search.
   *
   * @returns All users with the specified role.
   *
   * @throws `Error` - If no user with the given role could be found.
   */
  static getAllUserDocsWithRole(role: Role): TestDocument<UserModel>[] {
    const docs: TestDocument<UserModel>[] = [];

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

  findById(id: string) {
    for (const user of USER_DOCUMENTS) {
      if (user.id === id) {
        return user;
      }
    }

    throw new NotFoundException(`Mocked user with ID '${id} could not be found.'`);
  }
}
