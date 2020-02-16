import { UserModel } from '../../src/module/models/user.model';
import { Role } from '../../src/shared/model/Role';
import { generateObjectId } from '../helpers/test.helpers';
import { TestDocument } from '../helpers/testdocument';

export const USER_DOCUMENTS: readonly TestDocument<UserModel>[] = [
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
    roles: [Role.TUTOR],
    tutorials: [],
    tutorialsToCorrect: [],
  },
];

export class MockedUserService {
  findById(id: string) {
    for (const user of USER_DOCUMENTS) {
      if (user.id === id) {
        return user;
      }
    }

    throw new Error(`Mocked user with ID '${id} could not be found.'`);
  }
}
