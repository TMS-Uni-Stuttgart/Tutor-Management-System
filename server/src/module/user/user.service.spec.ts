import { BadRequestException, NotFoundException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { NamedElement } from 'shared/model/Common';
import { Role } from 'shared/model/Role';
import { ILoggedInUser, IUser } from 'shared/model/User';
import { sortListById } from '../../../test/helpers/test.helpers';
import { TestSuite } from '../../../test/helpers/TestSuite';
import { MOCKED_TUTORIALS, MOCKED_USERS } from '../../../test/mocks/entities.mock';
import { User } from '../../database/entities/user.entity';
import { TutorialService } from '../tutorial/tutorial.service';
import { CreateUserDTO, UserDTO } from './user.dto';
import { UserService } from './user.service';

interface AssertUserParam {
    expected: User;
    actual: User;
}

interface AssertUserListParam {
    expected: User[];
    actual: User[];
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
    expected: User;
    actual: ILoggedInUser;
}

/**
 * Checks if the given user representations are considered equal.
 *
 * Equality is defined as:
 * - The actual `id` matches the expected `id`.
 * - The rest of `expected` (__excluding `password`__) matches the rest of `actual`.
 *
 * @param params Must contain an expected TestDocument and the actual User object.
 */
function assertUser({ expected, actual }: AssertUserParam) {
    const { id, tutorials, tutorialsToCorrect, tutorialsToSubstitute, ...expectedUser } = expected;
    const {
        id: actualId,
        tutorials: actualTutorials,
        tutorialsToCorrect: actualTutorialsToCorrect,
        tutorialsToSubstitute: actualTutorialsToSubstitute,
        ...actualUser
    } = actual;

    expect(actualUser).toEqual(expectedUser);

    expect(
        actualTutorials
            .getItems()
            .map((t) => t.id)
            .sort()
    ).toEqual(
        tutorials
            .getItems()
            .map((t) => t.id)
            .sort()
    );
    expect(
        actualTutorialsToCorrect
            .getItems()
            .map((t) => t.id)
            .sort()
    ).toEqual(
        tutorialsToCorrect
            .getItems()
            .map((t) => t.id)
            .sort()
    );

    // TODO: Check tutorials the user is a substitute in.
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

    const expectedList = sortListById(expected);
    const actualList = sortListById(actual);

    for (let i = 0; i < actual.length; i++) {
        assertUser({
            expected: expectedList[i],
            actual: actualList[i],
        });
    }
}

/**
 * Checks if the given User and the given UserDTO are equal.
 *
 * Equality is defined as:
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
    } = actual;

    expect(id).toBeDefined();

    expect(actualTutorials.map((tutorial) => tutorial.id).sort()).toEqual(tutorials.sort());
    expect(actualToCorrect.map((tutorial) => tutorial.id).sort()).toEqual(
        tutorialsToCorrect.sort()
    );

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
    }
}

function assertLoggedInUser({ expected, actual }: AssertLoggedInUserParams) {
    const {
        id,
        firstname,
        lastname,
        roles,
        temporaryPassword,
        tutorials,
        tutorialsToCorrect,
    } = expected;

    expect(actual.id).toBe(id);
    expect(actual.firstname).toBe(firstname);
    expect(actual.lastname).toBe(lastname);
    expect(actual.roles).toEqual(roles);
    expect(actual.hasTemporaryPassword).toBe(!!temporaryPassword);

    expect(actual.tutorials.map((t) => t.id)).toEqual(tutorials.getItems().map((t) => t.id));
    expect(actual.tutorialsToCorrect.map((t) => t.id)).toEqual(
        tutorialsToCorrect.getItems().map((t) => t.id)
    );

    // TODO: Test substituteTutorials!
}

describe('UserService', () => {
    const suite = new TestSuite(UserService);

    it('find all users', async () => {
        const allUsers = await suite.service.findAll();

        assertUserList({
            expected: MOCKED_USERS,
            actual: allUsers,
        });
    });

    it('find user with one tutorial', async () => {
        const userWithTutorial = MOCKED_USERS[2];
        const fetchedUser = await suite.service.findById(userWithTutorial.id);

        assertUser({ expected: userWithTutorial, actual: fetchedUser });
    });

    it('find user with tutorials to correct', async () => {
        const userWithTutorialsToCorrect = MOCKED_USERS[3];
        const fetchedUser = await suite.service.findById(userWithTutorialsToCorrect.id);

        assertUser({ expected: userWithTutorialsToCorrect, actual: fetchedUser });
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

        const createdUser: IUser = await suite.service.create(userToCreate);
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
            tutorials: [MOCKED_TUTORIALS[1].id],
            tutorialsToCorrect: [],
        };
        const createdUser: IUser = await suite.service.create(userToCreate);
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
            tutorials: [MOCKED_TUTORIALS[0].id, MOCKED_TUTORIALS[1].id],
            tutorialsToCorrect: [],
        };

        const createdUser: IUser = await suite.service.create(userToCreate);
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

        await expect(suite.service.create(userToCreate)).rejects.toThrow(BadRequestException);
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
            tutorialsToCorrect: [MOCKED_TUTORIALS[0].id],
        };

        const createdUser: IUser = await suite.service.create(userToCreate);
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
            tutorialsToCorrect: [MOCKED_TUTORIALS[0].id, MOCKED_TUTORIALS[1].id],
        };

        const createdUser: IUser = await suite.service.create(userToCreate);
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
            tutorials: [MOCKED_TUTORIALS[0].id, MOCKED_TUTORIALS[1].id],
            tutorialsToCorrect: [],
        };

        await expect(suite.service.create(userToCreate)).rejects.toThrow(BadRequestException);
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
            tutorialsToCorrect: [MOCKED_TUTORIALS[0].id, MOCKED_TUTORIALS[1].id],
        };

        await expect(suite.service.create(userToCreate)).rejects.toThrow(BadRequestException);
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

        await expect(suite.service.create(userToCreate)).rejects.toThrow(BadRequestException);
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

        const created = await suite.service.createMany(usersToCreate);

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
                tutorials: [MOCKED_TUTORIALS[0].id],
                tutorialsToCorrect: [],
            },
            {
                firstname: 'Granger',
                lastname: 'Hermine',
                email: 'herminegranger@hogwarts.com',
                username: 'grangehe',
                password: 'grangersPassword',
                roles: [Role.TUTOR],
                tutorials: [MOCKED_TUTORIALS[1].id],
                tutorialsToCorrect: [],
            },
        ];

        const created = await suite.service.createMany(usersToCreate);

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
                tutorialsToCorrect: [MOCKED_TUTORIALS[0].id],
            },
            {
                firstname: 'Granger',
                lastname: 'Hermine',
                email: 'herminegranger@hogwarts.com',
                username: 'grangehe',
                password: 'grangersPassword',
                roles: [Role.CORRECTOR],
                tutorials: [],
                tutorialsToCorrect: [MOCKED_TUTORIALS[1].id],
            },
        ];

        const created = await suite.service.createMany(usersToCreate);

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
                tutorials: [MOCKED_TUTORIALS[0].id],
                tutorialsToCorrect: [],
            },
            {
                firstname: 'Granger',
                lastname: 'Hermine',
                email: 'herminegranger@hogwarts.com',
                username: 'grangehe',
                password: 'grangersPassword',
                roles: [Role.TUTOR, Role.CORRECTOR],
                tutorials: [MOCKED_TUTORIALS[1].id],
                tutorialsToCorrect: [MOCKED_TUTORIALS[0].id],
            },
        ];

        const created = await suite.service.createMany(usersToCreate);

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
                tutorials: [MOCKED_TUTORIALS[0].id],
                tutorialsToCorrect: [],
            },
            {
                firstname: 'Hermine',
                lastname: 'Granger',
                email: 'herminegranger@hogwarts.com',
                username: 'grangehe',
                password: 'grangersPassword',
                roles: [Role.TUTOR],
                tutorials: [MOCKED_TUTORIALS[1].id],
                tutorialsToCorrect: [],
            },
        ];

        const userCountBefore = (await suite.service.findAll()).length;
        await expect(suite.service.createMany(usersToCreate)).rejects.toThrow(
            new BadRequestException([
                "[Potter, Harry]: A user with tutorials needs to have the 'TUTOR' role",
            ])
        );

        // No user should have effectively been created.
        const userCountAfter = (await suite.service.findAll()).length;
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
                tutorialsToCorrect: [MOCKED_TUTORIALS[0].id],
            },
            {
                firstname: 'Hermine',
                lastname: 'Granger',
                email: 'herminegranger@hogwarts.com',
                username: 'grangehe',
                password: 'grangersPassword',
                roles: [Role.TUTOR],
                tutorials: [],
                tutorialsToCorrect: [MOCKED_TUTORIALS[1].id],
            },
        ];

        const userCountBefore = (await suite.service.findAll()).length;
        await expect(suite.service.createMany(usersToCreate)).rejects.toThrow(
            new BadRequestException([
                "[Granger, Hermine]: A user with tutorials to correct needs to have the 'CORRECTOR' role",
            ])
        );

        // No user should have effectively been created.
        const userCountAfter = (await suite.service.findAll()).length;
        expect(userCountAfter).toBe(userCountBefore);
    });

    it('get a user with a specific ID', async () => {
        const expected = MOCKED_USERS[0];
        const user = await suite.service.findById(expected.id);

        assertUser({ expected, actual: user });
    });

    it('fail on searching a non-existing user', async () => {
        await expect(suite.service.findById('non-existing-user')).rejects.toThrow(
            NotFoundException
        );
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

        const oldUser = await suite.service.create(userToCreate);
        const updatedUser = await suite.service.update(oldUser.id, updateDTO);

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
            tutorials: [MOCKED_TUTORIALS[0].id, MOCKED_TUTORIALS[2].id],
        };
        const userToCreate: CreateUserDTO = {
            ...updateDTO,
            tutorials: [MOCKED_TUTORIALS[0].id, MOCKED_TUTORIALS[1].id],
            password: 'herminesPassword',
        };

        const oldUser = await suite.service.create(userToCreate);
        const updatedUser = await suite.service.update(oldUser.id, updateDTO);

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
            tutorialsToCorrect: [MOCKED_TUTORIALS[0].id, MOCKED_TUTORIALS[2].id],
        };
        const userToCreate: CreateUserDTO = {
            ...updateDTO,
            tutorialsToCorrect: [MOCKED_TUTORIALS[0].id, MOCKED_TUTORIALS[1].id],
            password: 'herminesPassword',
        };

        const oldUser = await suite.service.create(userToCreate);
        const updatedUser = await suite.service.update(oldUser.id, updateDTO);

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

        const oldUser = await suite.service.create(userToCreate);
        await expect(suite.service.update(oldUser.id, updateDTO)).rejects.toThrow(
            BadRequestException
        );
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

        await expect(suite.service.update('non-existing-id', updateDTO)).rejects.toThrow(
            NotFoundException
        );
    });

    it('fail on updating user with non existing tutorial', async () => {
        const updateDTO: UserDTO = {
            firstname: 'Hermine',
            lastname: 'Granger',
            email: 'granger@hogwarts.com',
            username: 'grangehe',
            roles: [Role.TUTOR],
            tutorials: ['non-existing-tutorial', MOCKED_TUTORIALS[0].id],
            tutorialsToCorrect: [],
        };
        const userToCreate: CreateUserDTO = {
            ...updateDTO,
            tutorials: [MOCKED_TUTORIALS[0].id, MOCKED_TUTORIALS[1].id],
            password: 'herminesPassword',
        };

        const oldUser = await suite.service.create(userToCreate);
        await expect(suite.service.update(oldUser.id, updateDTO)).rejects.toThrow(
            NotFoundException
        );
    });

    it('fail on updating user with non existing tutorial to correct', async () => {
        const updateDTO: UserDTO = {
            firstname: 'Hermine',
            lastname: 'Granger',
            email: 'granger@hogwarts.com',
            username: 'grangehe',
            roles: [Role.CORRECTOR],
            tutorials: [],
            tutorialsToCorrect: ['non-existing-id', MOCKED_TUTORIALS[0].id],
        };
        const userToCreate: CreateUserDTO = {
            ...updateDTO,
            tutorialsToCorrect: [MOCKED_TUTORIALS[0].id, MOCKED_TUTORIALS[1].id],
            password: 'herminesPassword',
        };

        const oldUser = await suite.service.create(userToCreate);
        await expect(suite.service.update(oldUser.id, updateDTO)).rejects.toThrow(
            NotFoundException
        );
    });

    it('fail on changing the role of last admin', async () => {
        const lastAdminUser = MOCKED_USERS[0];
        const updateDTO: UserDTO = {
            roles: [Role.TUTOR], // Remove / Replace admin role
            firstname: lastAdminUser.firstname,
            lastname: lastAdminUser.lastname,
            username: lastAdminUser.username,
            email: lastAdminUser.email,
            tutorialsToCorrect: lastAdminUser.tutorialsToCorrect.getItems().map((t) => t.id),
            tutorials: lastAdminUser.tutorials.getItems().map((t) => t.id),
        };

        await expect(suite.service.update(lastAdminUser.id, updateDTO)).rejects.toThrow(
            BadRequestException
        );
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

        const user = await suite.service.create(dto);
        await suite.service.delete(user.id);

        await expect(suite.service.findById(user.id)).rejects.toThrow(NotFoundException);
    });

    it('delete a user with tutorials', async () => {
        const tutorial = MOCKED_TUTORIALS[0];
        const dto: CreateUserDTO = {
            firstname: 'Hermine',
            lastname: 'Granger',
            email: 'granger@hogwarts.com',
            username: 'grangehe',
            password: 'herminesPassword',
            roles: [Role.TUTOR],
            tutorials: [tutorial.id],
            tutorialsToCorrect: [],
        };

        const user = await suite.service.create(dto);
        await suite.service.delete(user.id);

        const tutorialService = suite.getService(TutorialService);
        const updatedTutorial = await tutorialService.findById(tutorial.id);

        await expect(suite.service.findById(user.id)).rejects.toThrow(NotFoundException);

        expect(updatedTutorial.tutor).toBeUndefined();
    });

    it('fail on deleting last admin', async () => {
        const adminUser = MOCKED_USERS[0];

        await expect(suite.service.delete(adminUser.id)).rejects.toThrow(BadRequestException);
        await expect(suite.service.findById(adminUser.id)).resolves.toBeDefined();
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

        const user = await suite.service.create(dto);
        const updatedUser = await suite.service.setPassword(user.id, newPassword);
        const userCredentials = await suite.service.findWithUsername(user.username);

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

        const user = await suite.service.create(dto);
        const updatedUser = await suite.service.setTemporaryPassword(user.id, newPassword);
        const userCredentials = await suite.service.findWithUsername(user.username);

        expect(updatedUser.temporaryPassword).toEqual(newPassword);
        expect(() => bcrypt.compareSync(newPassword, userCredentials.password)).toBeTruthy();
    });

    it('get the name of all tutors', async () => {
        // TODO: This does not work because the ids are hard-coded...
        const expected: NamedElement[] = [
            {
                id: '5e501290468622e257c2db16',
                firstname: 'Harry',
                lastname: 'Potter',
            },
            {
                id: '5e5013711922d1957bcf0c30',
                firstname: 'Ron',
                lastname: 'Weasley',
            },
            {
                id: '5e503ac11015dc73652731a6',
                firstname: 'Ginny',
                lastname: 'Weasley',
            },
        ];
        const namesOfTutors: NamedElement[] = await suite.service.getNamesOfAllTutors();
        expect(sortListById(namesOfTutors)).toEqual(sortListById(expected));
    });

    it('get user information on log in', async () => {
        const expected = MOCKED_USERS[2];
        const userInformation = await suite.service.getLoggedInUserInformation(expected.id);

        assertLoggedInUser({ expected, actual: userInformation });
    });
});
