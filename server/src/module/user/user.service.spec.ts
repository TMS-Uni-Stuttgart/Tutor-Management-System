import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DateTime } from 'luxon';
import { generateObjectId, sanitizeObject } from '../../../test/helpers/test.helpers';
import { TestModule } from '../../../test/helpers/test.module';
import { MockedModel } from '../../../test/helpers/testdocument';
import { createDatesForTutorial } from '../../../test/mocks/tutorial.service.mock';
import { Role } from '../../shared/model/Role';
import { CreateUserDTO, User } from '../../shared/model/User';
import { StudentModel } from '../models/student.model';
import { TutorialModel } from '../models/tutorial.model';
import { UserModel } from '../models/user.model';
import { TutorialService } from '../tutorial/tutorial.service';
import { UserService } from './user.service';

interface AssertUserParam {
  expected: MockedModel<UserModel>;
  actual: User;
}

interface AssertUserListParam {
  expected: MockedModel<UserModel>[];
  actual: User[];
}

const USER_DOCUMENTS: MockedModel<UserModel>[] = [
  {
    _id: '5e501290468622e257c2db16',
    firstname: 'Harry',
    lastname: 'Potter',
    email: 'harrypotter@hogwarts.com',
    username: 'potterhy',
    password: 'harrysPassword',
    temporaryPassword: 'someTemporatayPassword',
    roles: [Role.TUTOR],
    tutorials: [],
    tutorialsToCorrect: [],
  },
  {
    _id: '5e5013711922d1957bcf0c30',
    firstname: 'Ron',
    lastname: 'Weasley',
    email: 'weaslyron@hogwarts.com',
    username: 'weaslern',
    password: 'ronsPassword',
    temporaryPassword: undefined,
    roles: [Role.TUTOR],
    tutorials: [{ _id: '5e5014186db2b69773038a9d' } as any],
    tutorialsToCorrect: [],
  },
];

const TUTORIAL_DOCUMENTS: MockedModel<TutorialModel>[] = [
  {
    _id: '5e50141098205a0d95857492',
    tutor: undefined,
    slot: 'Tutorial 1',
    students: [],
    correctors: [],
    dates: createDatesForTutorial('2020-02-18'),
    startTime: DateTime.fromISO('08:00:00', { zone: 'utc' }).toJSDate(),
    endTime: DateTime.fromISO('09:30:00', { zone: 'utc' }).toJSDate(),
    substitutes: new Map(),
  },
  {
    _id: '5e5014186db2b69773038a9d',
    tutor: '5e5013711922d1957bcf0c30' as any,
    slot: 'Tutorial 2',
    students: [],
    correctors: [],
    dates: createDatesForTutorial('2020-02-21'),
    startTime: DateTime.fromISO('14:00:00', { zone: 'utc' }).toJSDate(),
    endTime: DateTime.fromISO('15:30:00', { zone: 'utc' }).toJSDate(),
    substitutes: new Map(),
  },
];

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
    id: actualId,
    tutorials: actualTutorials,
    tutorialsToCorrect: actualTutorialsToCorrect,
    ...actualUser
  } = sanitizeObject(actual);

  expect(actualId).toBeDefined();
  expect(actualUser).toEqual(expectedUser);

  expect(actualTutorials).toEqual(tutorials.map(t => t._id));
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
  let testModule: TestingModule;
  let service: UserService;

  beforeAll(async () => {
    testModule = await Test.createTestingModule({
      imports: [
        TestModule.forRootAsync([
          {
            model: UserModel,
            initialDocuments: [...USER_DOCUMENTS],
          },
          { model: TutorialModel, initialDocuments: [...TUTORIAL_DOCUMENTS] },
          { model: StudentModel, initialDocuments: [] },
        ]),
      ],
      providers: [UserService, TutorialService],
    }).compile();
  });

  beforeEach(async () => {
    await testModule.get<TestModule>(TestModule).reset();

    service = testModule.get<UserService>(UserService);
  });

  afterAll(async () => {
    await testModule.close();
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
      tutorials: [TUTORIAL_DOCUMENTS[1]._id],
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
      tutorials: [TUTORIAL_DOCUMENTS[0]._id, TUTORIAL_DOCUMENTS[1]._id],
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

  it('create user with ONE tutorial to correct', async () => {
    const userToCreate: CreateUserDTO = {
      firstname: 'Hermine',
      lastname: 'Granger',
      email: 'granger@hogwarts.com',
      username: 'grangehe',
      password: 'herminesPassword',
      roles: [Role.CORRECTOR],
      tutorials: [],
      tutorialsToCorrect: [TUTORIAL_DOCUMENTS[0]._id],
    };

    const createdUser: User = await service.create(userToCreate);
    const { password, ...expected } = userToCreate;
    const { temporaryPassword, id, ...actual } = sanitizeObject(createdUser);

    expect(actual).toEqual(expected);
    expect(temporaryPassword).toBe(password);
  });

  it('create user with multiple tutorials to correct', async () => {
    const userToCreate: CreateUserDTO = {
      firstname: 'Hermine',
      lastname: 'Granger',
      email: 'granger@hogwarts.com',
      username: 'grangehe',
      password: 'herminesPassword',
      roles: [Role.CORRECTOR],
      tutorials: [],
      tutorialsToCorrect: [TUTORIAL_DOCUMENTS[0]._id, TUTORIAL_DOCUMENTS[1]._id],
    };

    const createdUser: User = await service.create(userToCreate);
    const { password, ...expected } = userToCreate;
    const { temporaryPassword, id, ...actual } = sanitizeObject(createdUser);

    expect(actual).toEqual(expected);
    expect(temporaryPassword).toBe(password);
  });

  it('fail on creating non-tutor with tutorials', async () => {
    const userToCreate: CreateUserDTO = {
      firstname: 'Hermine',
      lastname: 'Granger',
      email: 'granger@hogwarts.com',
      username: 'grangehe',
      password: 'herminesPassword',
      roles: [Role.ADMIN],
      tutorials: [TUTORIAL_DOCUMENTS[0]._id, TUTORIAL_DOCUMENTS[1]._id],
      tutorialsToCorrect: [],
    };

    await expect(service.create(userToCreate)).rejects.toThrow(BadRequestException);
  });

  it('fail on creating non-corrector with tutorials to correct', async () => {
    const userToCreate: CreateUserDTO = {
      firstname: 'Hermine',
      lastname: 'Granger',
      email: 'granger@hogwarts.com',
      username: 'grangehe',
      password: 'herminesPassword',
      roles: [Role.EMPLOYEE],
      tutorials: [],
      tutorialsToCorrect: [TUTORIAL_DOCUMENTS[0]._id, TUTORIAL_DOCUMENTS[1]._id],
    };

    await expect(service.create(userToCreate)).rejects.toThrow(BadRequestException);
  });

  it('get a user with a specific ID', async () => {
    const expected = USER_DOCUMENTS[0];
    const user = await service.findById(expected._id);

    assertUser({ expected, actual: user.toDTO() });
  });

  it('fail on searching a non-existing user', async () => {
    const nonExistingId = generateObjectId();

    await expect(service.findById(nonExistingId)).rejects.toThrow(NotFoundException);
  });

  it('delete a user without tutorials', async () => {
    const dto: CreateUserDTO = {
      firstname: 'Hermine',
      lastname: 'Granger',
      email: 'granger@hogwarts.com',
      username: 'grangehe',
      password: 'herminesPassword',
      roles: [Role.TUTOR],
      tutorials: [],
      tutorialsToCorrect: [],
    };

    const user = await service.create(dto);
    const deletedUser = await service.delete(user.id);

    expect(deletedUser.id).toEqual(user.id);
    await expect(service.findById(user.id)).rejects.toThrow(NotFoundException);
  });
});
