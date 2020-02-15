import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { generateObjectId, sanitizeObject } from '../../helpers/test/test.helpers';
import { MongooseMockModelProvider } from '../../helpers/test/test.provider';
import { TestDocument } from '../../helpers/test/testdocument';
import { Role } from '../../shared/model/Role';
import { CreateUserDTO, User } from '../../shared/model/User';
import { TutorialDocument, TutorialModel } from '../models/tutorial.model';
import { UserModel } from '../models/user.model';
import { TutorialService } from '../tutorial/tutorial.service';
import { UserService } from './user.service';

type MockedUserModel = UserModel & { _id: string; decryptFieldsSync: () => void };

interface AssertUserParam {
  expected: MockedUserModel;
  actual: User;
}

interface AssertUserListParam {
  expected: MockedUserModel[];
  actual: User[];
}

const TUTORIAL_DOCUMENTS: TestDocument<TutorialModel>[] = [
  {
    id: generateObjectId(),
    tutor: undefined,
    slot: 'Test 1',
    students: [],
    correctors: [],
    dates: [new Date()],
    startTime: new Date(),
    endTime: new Date(),
  },
  {
    id: generateObjectId(),
    tutor: undefined,
    slot: 'Test 2',
    students: [],
    correctors: [],
    dates: [new Date()],
    startTime: new Date(),
    endTime: new Date(),
  },
];

// eslint-disable-next-line @typescript-eslint/no-empty-function
function decryptFieldsSync(this: MockedUserModel) {}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function encryptFieldsSync(this: MockedUserModel) {}

const USER_DOCUMENTS: MockedUserModel[] = [
  createUserMockModel(
    new UserModel({
      firstname: 'Harry',
      lastname: 'Potter',
      email: 'harrypotter@hogwarts.com',
      username: 'potterhy',
      password: 'harrysPassword',
      temporaryPassword: undefined,
      roles: [Role.TUTOR],
      tutorials: [],
      tutorialsToCorrect: [],
    })
  ),
  createUserMockModel(
    new UserModel({
      firstname: 'Ron',
      lastname: 'Weasley',
      email: 'weaslyron@hogwarts.com',
      username: 'weaslern',
      password: 'ronsPassword',
      temporaryPassword: undefined,
      roles: [Role.TUTOR],
      tutorials: [TUTORIAL_DOCUMENTS[0] as TutorialDocument],
      tutorialsToCorrect: [],
    })
  ),
];

function createUserMockModel(model: UserModel): MockedUserModel {
  const mocked = Object.assign(model, {
    _id: generateObjectId(),
    decryptFieldsSync,
  });

  return mocked;
}

function mockFindTutorial(id: string): TestDocument<TutorialModel> {
  for (const tutorial of TUTORIAL_DOCUMENTS) {
    if (tutorial.id === id) {
      return tutorial;
    }
  }

  throw new Error(`Mocked tutorial with ID '${id} could not be found.'`);
}

/**
 * Checks if the given user representations are considered equal.
 *
 * Equality is defined as:
 * - The actual `id` matches the expected `_id`.
 * - The rest of `expected` (__excluding `password`__) matches the rest of `actual`.
 *
 * @param params Must contain an expected TestDocument and the actual User object.
 */
function assertUser({ expected, actual }: AssertUserParam) {
  const { _id, password, tutorials, tutorialsToCorrect, ...expectedUser } = sanitizeObject(
    expected
  );
  const {
    tutorials: actualTutorials,
    tutorialsToCorrect: actualTutorialsToCorrect,
    ...actualUser
  } = actual;

  expect(actualUser.id).toBe(_id);
  expect(actualUser).toEqual(expectedUser);

  expect(actualTutorials).toEqual(tutorials.map(t => t.id));
  expect(actualTutorialsToCorrect).toEqual(tutorialsToCorrect.map(t => t._id));
}

/**
 * Checks if the given actual list of users is equal to the expected one.
 *
 * Equality is defined as:
 * - All actual users are "equal" to their corresponding expected part. Equality is defined by `assertUser()`.
 * - Both list are in the same order.
 *
 * @param params Must contain a list of expected TestDocuments and the actual list of Users.
 */
function assertUserList({ expected, actual }: AssertUserListParam) {
  expect(actual.length).toBe(expected.length);

  for (let i = 0; i < actual.length; i++) {
    assertUser({
      expected: expected[i],
      actual: actual[i],
    });
  }
}

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: TutorialService,
          useValue: {
            findById: mockFindTutorial,
          },
        },
        MongooseMockModelProvider.create({
          modelClass: UserModel,
          documents: USER_DOCUMENTS,
          additionalDocProperties: {
            decryptFieldsSync,
            encryptFieldsSync,
          },
        }),
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('find all users', async () => {
    const allUsers: User[] = await service.findAll();

    assertUserList({ expected: USER_DOCUMENTS, actual: sanitizeObject(allUsers) });
  });

  it('create user without tutorials', async () => {
    const userToCreate: CreateUserDTO = {
      firstname: 'Hermine',
      lastname: 'Granger',
      email: 'granger@hogwarts.com',
      username: 'grangehe',
      password: 'herminesPassword',
      roles: [Role.TUTOR],
      tutorials: [],
      tutorialsToCorrect: [],
    };

    const createdUser: User = await service.create(userToCreate);
    const { password, ...expected } = userToCreate;
    const { temporaryPassword, id, ...actual } = sanitizeObject(createdUser);

    expect(actual).toEqual(expected);
    expect(temporaryPassword).toBe(password);
  });

  it('create user with ONE tutorial', async () => {
    const userToCreate: CreateUserDTO = {
      firstname: 'Hermine',
      lastname: 'Granger',
      email: 'granger@hogwarts.com',
      username: 'grangehe',
      password: 'herminesPassword',
      roles: [Role.TUTOR],
      tutorials: [TUTORIAL_DOCUMENTS[1].id],
      tutorialsToCorrect: [],
    };

    const createdUser: User = await service.create(userToCreate);
    const { password, ...expected } = userToCreate;
    const { temporaryPassword, id, ...actual } = sanitizeObject(createdUser);

    expect(actual).toEqual(expected);
    expect(temporaryPassword).toBe(password);
  });

  it('create user with multiple tutorials', async () => {
    const userToCreate: CreateUserDTO = {
      firstname: 'Hermine',
      lastname: 'Granger',
      email: 'granger@hogwarts.com',
      username: 'grangehe',
      password: 'herminesPassword',
      roles: [Role.TUTOR],
      tutorials: [TUTORIAL_DOCUMENTS[0].id, TUTORIAL_DOCUMENTS[1].id],
      tutorialsToCorrect: [],
    };

    const createdUser: User = await service.create(userToCreate);
    const { password, ...expected } = userToCreate;
    const { temporaryPassword, id, ...actual } = sanitizeObject(createdUser);

    expect(actual).toEqual(expected);
    expect(temporaryPassword).toBe(password);
  });

  it('fail on creating a user with already existing username', async () => {
    const userToCreate: CreateUserDTO = {
      firstname: 'Hermine',
      lastname: 'Granger',
      email: 'granger@hogwarts.com',
      username: 'potterhy',
      password: 'herminesPassword',
      roles: [Role.TUTOR],
      tutorials: [],
      tutorialsToCorrect: [],
    };

    await expect(service.create(userToCreate)).rejects.toThrow(BadRequestException);
  });
});
