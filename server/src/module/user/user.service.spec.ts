import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import bcrypt from 'bcryptjs';
import { generateObjectId, sanitizeObject } from '../../../test/helpers/test.helpers';
import { TestModule } from '../../../test/helpers/test.module';
import { MockedModel } from '../../../test/helpers/testdocument';
import { TUTORIAL_DOCUMENTS, USER_DOCUMENTS } from '../../../test/mocks/documents.mock';
import { UserModel } from '../../database/models/user.model';
import { NamedElement } from '../../shared/model/Common';
import { Role } from '../../shared/model/Role';
import { ILoggedInUser, IUser } from '../../shared/model/User';
import { TutorialService } from '../tutorial/tutorial.service';
import { CreateUserDTO, UserDTO } from './user.dto';
import { UserService } from './user.service';

interface AssertUserParam {
  expected: MockedModel<UserModel>;
  actual: IUser;
}

interface AssertUserListParam {
  expected: MockedModel<UserModel>[];
  actual: IUser[];
}

interface AssertUserDTOParams {
  expected: UserDTO & { password?: string };
  actual: IUser;
}

interface AssertGeneratedUsersParams {
  expected: CreateUserDTO[];
  actual: IUser[];
}

interface AssertLoggedInUserParams {
  expected: MockedModel<UserModel>;
  actual: ILoggedInUser;
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
    id: actualId,
    tutorials: actualTutorials,
    tutorialsToCorrect: actualTutorialsToCorrect,
    ...actualUser
  } = sanitizeObject(actual);

  expect(actualId).toBeDefined();
  expect(actualUser).toEqual(expectedUser);

  expect(actualTutorials.map((t) => t.id)).toEqual(tutorials.map((t) => t._id));
  expect(actualTutorialsToCorrect.map((t) => t.id)).toEqual(tutorialsToCorrect.map((t) => t._id));
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

/**
 * Checks if the given User and the given UserDTO are equal.
 *
 * Equalitiy is defined as:
 * - The IDs of the tutorials are the same.
 * - The IDS of the tutorials to correct are the same.
 * - If `expected` has a `password` field the `temporaryPassword` field of the `actual` user must match the `password` field.
 * - The rest of `expected` matches the rest of `actual` (__excluding `id` and `temporaryPassword`__).
 *
 * @param params Must contain an expected UserDTO and an actual User.
 */
function assertUserDTO({ expected, actual }: AssertUserDTOParams) {
  const { tutorials, tutorialsToCorrect, password, ...restExpected } = expected;
  const {
    id,
    temporaryPassword,
    tutorials: actualTutorials,
    tutorialsToCorrect: actualToCorrect,
    ...restActual
  } = sanitizeObject(actual);

  expect(id).toBeDefined();

  expect(actualTutorials.map((tutorial) => tutorial.id)).toEqual(tutorials);
  expect(actualToCorrect.map((tutorial) => tutorial.id)).toEqual(tutorialsToCorrect);

  if (!!password) {
    expect(temporaryPassword).toEqual(password);
  }

  expect(restActual).toEqual(restExpected);
}

/**
 * Checks if the two given lists match.
 *
 * Matching is defined as:
 * - Both lists have the same length.
 * - Each DTO has a corresponding user which got created using it's information.
 *
 * @param expected List containing the DTO holding the information of the users which should have been created.
 * @param actual List of actually generated users.
 */
function assertGeneratedUsers({ expected, actual }: AssertGeneratedUsersParams) {
  expect(actual.length).toBe(expected.length);

  for (const { ...dto } of expected) {
    const idx = actual.findIndex((u) => u.username === dto.username);
    const user = actual[idx];

    expect(idx).not.toBe(-1);
    assertUserDTO({ expected: dto, actual: user });
    // expect(user.temporaryPassword).toEqual(password);
  }
}

function assertLoggedInUser({ expected, actual }: AssertLoggedInUserParams) {
  const {
    _id,
    firstname,
    lastname,
    roles,
    temporaryPassword,
    tutorials,
    tutorialsToCorrect,
  } = sanitizeObject(expected);

  expect(actual.id).toBe(_id);
  expect(actual.firstname).toBe(firstname);
  expect(actual.lastname).toBe(lastname);
  expect(actual.roles).toEqual(roles);
  expect(actual.hasTemporaryPassword).toBe(!!temporaryPassword);

  expect(actual.tutorials.map((t) => t.id)).toEqual(tutorials.map((t) => t.id));
  expect(actual.tutorialsToCorrect.map((t) => t.id)).toEqual(tutorialsToCorrect.map((t) => t.id));

  // TODO: Test substituteTutorials!
  // expect(actual.substituteTutorials).toEqual
}

describe('UserService', () => {
  let testModule: TestingModule;
  let service: UserService;

  beforeAll(async () => {
    testModule = await Test.createTestingModule({
      imports: [TestModule.forRootAsync()],
      providers: [UserService, TutorialService],
    }).compile();
  });

  afterAll(async () => {
    await testModule.close();
  });

  beforeEach(async () => {
    await testModule.get<TestModule>(TestModule).reset();

    service = testModule.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('find all users', async () => {
    const allUsers = await service.findAll();

    assertUserList({
      expected: USER_DOCUMENTS,
      actual: sanitizeObject(allUsers.map((user) => user.toDTO())),
    });
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

    const createdUser: IUser = await service.create(userToCreate);
    const { password, ...expected } = userToCreate;

    assertUserDTO({ expected, actual: createdUser });
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
    const createdUser: IUser = await service.create(userToCreate);
    const { password, ...expected } = userToCreate;

    assertUserDTO({ expected, actual: createdUser });
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

    const createdUser: IUser = await service.create(userToCreate);
    const { password, ...expected } = userToCreate;

    assertUserDTO({ expected, actual: createdUser });
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

    const createdUser: IUser = await service.create(userToCreate);
    const { password, ...expected } = userToCreate;

    assertUserDTO({ expected, actual: createdUser });
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

    const createdUser: IUser = await service.create(userToCreate);
    const { password, ...expected } = userToCreate;

    assertUserDTO({ expected, actual: createdUser });
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

  it('fail on creating a user with already existing username', async () => {
    const userToCreate: CreateUserDTO = {
      firstname: 'Harry',
      lastname: 'Potter',
      email: 'harrypotter@hogwarts.com',
      username: 'potterhy',
      password: 'harrysPassword',
      roles: [Role.TUTOR],
      tutorials: [],
      tutorialsToCorrect: [],
    };

    await expect(service.create(userToCreate)).rejects.toThrow(BadRequestException);
  });

  it('create multiple users without tutorials', async () => {
    const usersToCreate: CreateUserDTO[] = [
      {
        firstname: 'Harry',
        lastname: 'Potter',
        email: 'harrypotter@hogwarts.com',
        username: 'usernameOfHarry',
        password: 'harrysPassword',
        roles: [Role.TUTOR],
        tutorials: [],
        tutorialsToCorrect: [],
      },
      {
        firstname: 'Granger',
        lastname: 'Hermine',
        email: 'herminegranger@hogwarts.com',
        username: 'grangehe',
        password: 'grangersPassword',
        roles: [Role.TUTOR],
        tutorials: [],
        tutorialsToCorrect: [],
      },
    ];

    const created = await service.createMany(usersToCreate);

    assertGeneratedUsers({ expected: usersToCreate, actual: created });
  });

  it('create mutliple users with one tutorial each', async () => {
    const usersToCreate: CreateUserDTO[] = [
      {
        firstname: 'Harry',
        lastname: 'Potter',
        email: 'harrypotter@hogwarts.com',
        username: 'usernameOfHarry',
        password: 'harrysPassword',
        roles: [Role.TUTOR],
        tutorials: [TUTORIAL_DOCUMENTS[0]._id],
        tutorialsToCorrect: [],
      },
      {
        firstname: 'Granger',
        lastname: 'Hermine',
        email: 'herminegranger@hogwarts.com',
        username: 'grangehe',
        password: 'grangersPassword',
        roles: [Role.TUTOR],
        tutorials: [TUTORIAL_DOCUMENTS[1]._id],
        tutorialsToCorrect: [],
      },
    ];

    const created = await service.createMany(usersToCreate);

    assertGeneratedUsers({ expected: usersToCreate, actual: created });
  });

  it('create multiple users with one tutorial to correct each', async () => {
    const usersToCreate: CreateUserDTO[] = [
      {
        firstname: 'Harry',
        lastname: 'Potter',
        email: 'harrypotter@hogwarts.com',
        username: 'usernameOfHarry',
        password: 'harrysPassword',
        roles: [Role.CORRECTOR],
        tutorials: [],
        tutorialsToCorrect: [TUTORIAL_DOCUMENTS[0]._id],
      },
      {
        firstname: 'Granger',
        lastname: 'Hermine',
        email: 'herminegranger@hogwarts.com',
        username: 'grangehe',
        password: 'grangersPassword',
        roles: [Role.CORRECTOR],
        tutorials: [],
        tutorialsToCorrect: [TUTORIAL_DOCUMENTS[1]._id],
      },
    ];

    const created = await service.createMany(usersToCreate);

    assertGeneratedUsers({ expected: usersToCreate, actual: created });
  });

  it('create multiple users with tutorials and tutorials to correct.', async () => {
    const usersToCreate: CreateUserDTO[] = [
      {
        firstname: 'Harry',
        lastname: 'Potter',
        email: 'harrypotter@hogwarts.com',
        username: 'usernameOfHarry',
        password: 'harrysPassword',
        roles: [Role.TUTOR],
        tutorials: [TUTORIAL_DOCUMENTS[0]._id],
        tutorialsToCorrect: [],
      },
      {
        firstname: 'Granger',
        lastname: 'Hermine',
        email: 'herminegranger@hogwarts.com',
        username: 'grangehe',
        password: 'grangersPassword',
        roles: [Role.TUTOR, Role.CORRECTOR],
        tutorials: [TUTORIAL_DOCUMENTS[1]._id],
        tutorialsToCorrect: [TUTORIAL_DOCUMENTS[0]._id],
      },
    ];

    const created = await service.createMany(usersToCreate);

    assertGeneratedUsers({ expected: usersToCreate, actual: created });
  });

  it('fail with correct error on creating multiple users with tutorials where one is NOT a tutor', async () => {
    const usersToCreate: CreateUserDTO[] = [
      {
        firstname: 'Harry',
        lastname: 'Potter',
        email: 'harrypotter@hogwarts.com',
        username: 'usernameOfHarry',
        password: 'harrysPassword',
        roles: [Role.CORRECTOR],
        tutorials: [TUTORIAL_DOCUMENTS[0]._id],
        tutorialsToCorrect: [],
      },
      {
        firstname: 'Hermine',
        lastname: 'Granger',
        email: 'herminegranger@hogwarts.com',
        username: 'grangehe',
        password: 'grangersPassword',
        roles: [Role.TUTOR],
        tutorials: [TUTORIAL_DOCUMENTS[1]._id],
        tutorialsToCorrect: [],
      },
    ];

    const userCountBefore = (await service.findAll()).length;
    await expect(service.createMany(usersToCreate)).rejects.toThrow(
      `["[Potter, Harry]: A user with tutorials needs to have the 'TUTOR' role"]`
    );

    // No user should have effectively been created.
    const userCountAfter = (await service.findAll()).length;
    expect(userCountAfter).toBe(userCountBefore);
  });

  it('fail with correct error on creating multiple users with tutorials to correct where one is NOT a corrector', async () => {
    const usersToCreate: CreateUserDTO[] = [
      {
        firstname: 'Harry',
        lastname: 'Potter',
        email: 'harrypotter@hogwarts.com',
        username: 'usernameOfHarry',
        password: 'harrysPassword',
        roles: [Role.CORRECTOR],
        tutorials: [],
        tutorialsToCorrect: [TUTORIAL_DOCUMENTS[0]._id],
      },
      {
        firstname: 'Hermine',
        lastname: 'Granger',
        email: 'herminegranger@hogwarts.com',
        username: 'grangehe',
        password: 'grangersPassword',
        roles: [Role.TUTOR],
        tutorials: [],
        tutorialsToCorrect: [TUTORIAL_DOCUMENTS[1]._id],
      },
    ];

    const userCountBefore = (await service.findAll()).length;
    await expect(service.createMany(usersToCreate)).rejects.toThrow(
      `["[Granger, Hermine]: A user with tutorials to correct needs to have the 'CORRECTOR' role"]`
    );

    // No user should have effectively been created.
    const userCountAfter = (await service.findAll()).length;
    expect(userCountAfter).toBe(userCountBefore);
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

  it('update an existing user with basic information', async () => {
    const userToCreate: CreateUserDTO = {
      firstname: 'Hermine',
      lastname: 'Granger',
      email: 'granger@hogwarts.com',
      username: 'grangehe',
      password: 'herminesPassword',
      roles: [Role.EMPLOYEE],
      tutorials: [],
      tutorialsToCorrect: [],
    };
    const updateDTO: UserDTO = {
      firstname: 'Cho',
      lastname: 'Chang',
      email: 'cho_chang@hogwarts.com',
      username: 'changco',
      roles: [Role.EMPLOYEE, Role.TUTOR],
      tutorials: [],
      tutorialsToCorrect: [],
    };

    const oldUser = await service.create(userToCreate);
    const updatedUser = await service.update(oldUser.id, updateDTO);

    expect(updatedUser.id).toEqual(oldUser.id);
    assertUserDTO({ expected: updateDTO, actual: updatedUser });
  });

  it('update tutorials to be tutor of an existing user', async () => {
    const updateDTO: UserDTO = {
      firstname: 'Hermine',
      lastname: 'Granger',
      email: 'granger@hogwarts.com',
      username: 'grangehe',
      roles: [Role.TUTOR],
      tutorialsToCorrect: [],
      tutorials: [TUTORIAL_DOCUMENTS[0]._id, TUTORIAL_DOCUMENTS[2]._id],
    };
    const userToCreate: CreateUserDTO = {
      ...updateDTO,
      tutorials: [TUTORIAL_DOCUMENTS[0]._id, TUTORIAL_DOCUMENTS[1]._id],
      password: 'herminesPassword',
    };

    const oldUser = await service.create(userToCreate);
    const updatedUser = await service.update(oldUser.id, updateDTO);

    expect(updatedUser.id).toEqual(oldUser.id);
    assertUserDTO({ expected: updateDTO, actual: updatedUser });
  });

  it('update tutorials to correct of an existing user', async () => {
    const updateDTO: UserDTO = {
      firstname: 'Hermine',
      lastname: 'Granger',
      email: 'granger@hogwarts.com',
      username: 'grangehe',
      roles: [Role.CORRECTOR],
      tutorials: [],
      tutorialsToCorrect: [TUTORIAL_DOCUMENTS[0]._id, TUTORIAL_DOCUMENTS[2]._id],
    };
    const userToCreate: CreateUserDTO = {
      ...updateDTO,
      tutorialsToCorrect: [TUTORIAL_DOCUMENTS[0]._id, TUTORIAL_DOCUMENTS[1]._id],
      password: 'herminesPassword',
    };

    const oldUser = await service.create(userToCreate);
    const updatedUser = await service.update(oldUser.id, updateDTO);

    expect(updatedUser.id).toEqual(oldUser.id);
    assertUserDTO({ expected: updateDTO, actual: updatedUser });
  });

  it('fail on updating with already existing username', async () => {
    const updateDTO: UserDTO = {
      firstname: 'Hermine',
      lastname: 'Granger',
      email: 'granger_hermine@hogwarts.com',
      username: 'potterhy',
      roles: [Role.CORRECTOR],
      tutorials: [],
      tutorialsToCorrect: [],
    };
    const userToCreate: CreateUserDTO = {
      ...updateDTO,
      username: 'grangehe',
      password: 'herminesPassword',
    };

    const oldUser = await service.create(userToCreate);
    await expect(service.update(oldUser.id, updateDTO)).rejects.toThrow(BadRequestException);
  });

  it('fail on updating non existing user', async () => {
    const updateDTO: UserDTO = {
      firstname: 'Hermine',
      lastname: 'Granger',
      email: 'granger_hermine@hogwarts.com',
      username: 'potterhy',
      roles: [Role.CORRECTOR],
      tutorials: [],
      tutorialsToCorrect: [],
    };

    await expect(service.update(generateObjectId(), updateDTO)).rejects.toThrow(NotFoundException);
  });

  it('fail on updating user with non existing tutorial', async () => {
    const updateDTO: UserDTO = {
      firstname: 'Hermine',
      lastname: 'Granger',
      email: 'granger@hogwarts.com',
      username: 'grangehe',
      roles: [Role.TUTOR],
      tutorials: [generateObjectId(), TUTORIAL_DOCUMENTS[0]._id],
      tutorialsToCorrect: [],
    };
    const userToCreate: CreateUserDTO = {
      ...updateDTO,
      tutorials: [TUTORIAL_DOCUMENTS[0]._id, TUTORIAL_DOCUMENTS[1]._id],
      password: 'herminesPassword',
    };

    const oldUser = await service.create(userToCreate);
    await expect(service.update(oldUser.id, updateDTO)).rejects.toThrow(NotFoundException);
  });

  it('fail on updating user with non existing tutorial to correct', async () => {
    const updateDTO: UserDTO = {
      firstname: 'Hermine',
      lastname: 'Granger',
      email: 'granger@hogwarts.com',
      username: 'grangehe',
      roles: [Role.CORRECTOR],
      tutorials: [],
      tutorialsToCorrect: [generateObjectId(), TUTORIAL_DOCUMENTS[0]._id],
    };
    const userToCreate: CreateUserDTO = {
      ...updateDTO,
      tutorialsToCorrect: [TUTORIAL_DOCUMENTS[0]._id, TUTORIAL_DOCUMENTS[1]._id],
      password: 'herminesPassword',
    };

    const oldUser = await service.create(userToCreate);
    await expect(service.update(oldUser.id, updateDTO)).rejects.toThrow(NotFoundException);
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

  it('update the password of a user', async () => {
    const newPassword: string = 'anotherPassword';
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
    const updatedUser = await service.setPassword(user.id, newPassword);
    const userCredentials = await service.findWithUsername(user.username);

    expect(updatedUser.temporaryPassword).toBeUndefined();
    expect(() => bcrypt.compareSync(newPassword, userCredentials.password)).toBeTruthy();
  });

  it('update the temporary password of a user', async () => {
    const newPassword: string = 'anotherPassword';
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
    const updatedUser = await service.setTemporaryPassword(user.id, newPassword);
    const userCredentials = await service.findWithUsername(user.username);

    expect(updatedUser.temporaryPassword).toEqual(newPassword);
    expect(() => bcrypt.compareSync(newPassword, userCredentials.password)).toBeTruthy();
  });

  it('get the name of all tutors', async () => {
    const expected: NamedElement[] = [
      { id: '5e501290468622e257c2db16', firstname: 'Harry', lastname: 'Potter' },
      { id: '5e5013711922d1957bcf0c30', firstname: 'Ron', lastname: 'Weasley' },
      { id: '5e503ac11015dc73652731a6', firstname: 'Ginny', lastname: 'Weasley' },
    ];
    const namesOfTutors: NamedElement[] = await service.getNamesOfAllTutors();
    expect(namesOfTutors).toEqual(expected);
  });

  it('get user information on log in', async () => {
    const idOfUser = USER_DOCUMENTS[2]._id;
    const userInformation = await service.getLoggedInUserInformation(idOfUser);

    assertLoggedInUser({ expected: USER_DOCUMENTS[0], actual: userInformation });
  });
});
