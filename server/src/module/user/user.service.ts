import { Collection, EntityRepository } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import {
    BadRequestException,
    forwardRef,
    Inject,
    Injectable,
    Logger,
    NotFoundException,
    OnApplicationBootstrap,
} from '@nestjs/common';
import { NamedElement } from 'shared/model/Common';
import { Role } from 'shared/model/Role';
import { ILoggedInUser, IUser } from 'shared/model/User';
import { UserCredentialsWithPassword } from '../../auth/auth.model';
import { Tutorial } from '../../database/entities/tutorial.entity';
import { User } from '../../database/entities/user.entity';
import { CRUDService } from '../../helpers/CRUDService';
import { TutorialService } from '../tutorial/tutorial.service';
import { CreateUserDTO, UserDTO } from './user.dto';

@Injectable()
export class UserService implements OnApplicationBootstrap, CRUDService<IUser, UserDTO, User> {
    private readonly logger = new Logger(UserService.name);
    private readonly repository: EntityRepository<User>;

    constructor(
        @Inject(forwardRef(() => TutorialService))
        private readonly tutorialService: TutorialService,
        private readonly entityManager: EntityManager
    ) {
        this.repository = entityManager.fork().getRepository(User);
    }

    /**
     * Creates a new administrator on application start if there are no users present in the DB.
     */
    async onApplicationBootstrap(): Promise<void> {
        const areUsersPresent = (await this.repository.findAll()).length > 0;

        if (!areUsersPresent) {
            this.logger.log('No admin user found in database. Creating new admin...');
            const user = await this.repository.create(
                new User({
                    firstname: 'Created',
                    lastname: 'Admin',
                    roles: [Role.ADMIN],
                    username: 'admin',
                    password: 'adminPass',
                    temporaryPassword: 'adminPass',
                    email: 'admin@email.mail',
                })
            );

            await this.repository.persistAndFlush(user);
            this.logger.log('Admin user successfully created.');
        }
    }

    /**
     * @returns All users saved in the database.
     */
    async findAll(): Promise<User[]> {
        return this.repository.findAll({ populate: true });
    }

    /**
     * Searches for a user with the given ID and returns its document if possible.
     *
     * @param id ID to search for.
     *
     * @returns UserDocument with the given ID.
     *
     * @throws `NotFoundException` - If there is no user with the given ID.
     */
    async findById(id: string): Promise<User> {
        const user = await this.repository.findOne({ id }, { populate: true });

        if (!user) {
            throw new NotFoundException(`User with the ID '${id}' could not be found.`);
        }

        return user;
    }

    /**
     * Returns the credentials of the user with the given username.
     *
     * If no user with that username exists a `NotFoundException` is thrown.
     *
     * @param usernameToFind Username to search
     *
     * @returns UserCredentials of the user.
     *
     * @throws `NotFoundException` - If no user could be found
     */
    async findWithUsername(usernameToFind: string): Promise<UserCredentialsWithPassword> {
        const { id, username, password, roles } = await this.getUserWithUsername(usernameToFind);

        return { id, username, password, roles };
    }

    /**
     * Creates a new user and saves it to the database.
     *
     * @param user Information to create the user from.
     *
     * @returns Created user.
     */
    async create(user: CreateUserDTO): Promise<IUser> {
        const createdUser = await this.createUser(user);
        await this.repository.persistAndFlush(createdUser);
        return createdUser.toDTO();
    }

    /**
     * Creates multiple new users from the given information and saves them to the database.
     *
     * @param users Information of all users to create.
     *
     * @returns Created users.
     */
    async createMany(users: CreateUserDTO[]): Promise<IUser[]> {
        const em = this.entityManager.fork({ clear: false });
        await em.begin();
        const errors: string[] = [];
        const created: User[] = [];

        for (const user of users) {
            try {
                const createdUser = await this.createUser(user);
                created.push(createdUser);
                em.persist(createdUser);
            } catch (err) {
                const message: string = err instanceof Error ? err.message : 'Unknown error';
                errors.push(`[${user.lastname}, ${user.firstname}]: ${message}`);
            }
        }

        if (errors.length === 0) {
            await em.commit();
        } else {
            await em.rollback();
            throw new BadRequestException(errors);
        }

        return created.map((user) => user.toDTO());
    }

    /**
     * Updates the user with the given information
     *
     * If necessary this functions updates all related tutorials and saves them afterwards. Related tutorials can be:
     * - Tutorials of which the user _was_ the tutor.
     * - Tutorials of which the user _will be_ the tutor.
     * - Tutorials of which the user _was_ a corrector.
     * - Tutorials of which the user _will be_ a corrector.
     *
     * @param id ID of the user to update.
     * @param dto Information to update the user with.
     *
     * @returns Updated user.
     *
     * @throws `NotFoundException` - If there is no user with the given `id`.
     * @throws `BadRequestException` - {@link UserService#checkUserDTO}
     */
    async update(id: string, dto: UserDTO): Promise<IUser> {
        const user = await this.findById(id);

        await this.checkUserDTO(dto, user);
        await this.assertUserIsChangeable(user, dto);

        const [tutorials, tutorialsToCorrect] = await Promise.all([
            this.getAllTutorials(dto.tutorials),
            this.getAllTutorials(dto.tutorialsToCorrect),
        ]);

        user.firstname = dto.firstname;
        user.lastname = dto.lastname;
        user.username = dto.username;
        user.email = dto.email;
        user.roles = dto.roles;
        user.tutorials.set(tutorials);
        user.tutorialsToCorrect.set(tutorialsToCorrect);

        await this.repository.persistAndFlush(user);
        return user.toDTO();
    }

    /**
     * Delete the user with the given ID if one exists.
     *
     * @param id ID of the user to delete.
     *
     * @returns Deleted document.
     *
     * @throws `NotFoundException` - If there is no user with such an ID.
     * @throws `BadRequestException` - If the deleted user is the last available ADMIN.
     */
    async delete(id: string): Promise<void> {
        const user = await this.findById(id);
        await this.assertUserIsDeletable(user);

        user.tutorials.removeAll();
        user.tutorialsToCorrect.removeAll();
        user.tutorialsToSubstitute.removeAll();

        await this.repository.removeAndFlush(user);
    }

    /**
     * Sets the password of the given user to the given one. This will remove the `temporaryPassword` from the user.
     *
     * If one wants to set the temporary password aswell one should use the `setTemporaryPassword()` function.
     *
     * @param id ID of the user.
     * @param password (New) password.
     *
     * @returns Updated UserDocument
     *
     * @throws `NotFoundException` - If no user with the given ID could be found.
     */
    async setPassword(id: string, password: string): Promise<User> {
        const user = await this.findById(id);

        user.password = password;
        user.temporaryPassword = undefined;
        await this.repository.persistAndFlush(user);

        return user;
    }

    /**
     * Sets the password _and_ the temporary password of the user to the given one.
     *
     * If one only wants to set the password while removing the temporary one, one should use the `setPassword()` function.
     *
     * @param id ID of the user.
     * @param password (New) password.
     *
     * @returns Updated User
     *
     * @throws `NotFoundException` - If no user with the given ID could be found.
     */
    async setTemporaryPassword(id: string, password: string): Promise<User> {
        const user = await this.findById(id);

        user.password = password;
        user.temporaryPassword = password;
        await this.repository.persistAndFlush(user);

        return user;
    }

    /**
     * Collects and returns the information about a user which just logged in and needs it's information.
     *
     * @param id ID of the user to get the information on login for.
     *
     * @returns Information for the user on logging in.
     *
     * @throws `NotFoundException` - If no user with the given ID could be found.
     */
    async getLoggedInUserInformation(id: string): Promise<ILoggedInUser> {
        const user = await this.findById(id);
        const {
            id: userId,
            firstname,
            lastname,
            roles,
            temporaryPassword,
            tutorials,
            tutorialsToCorrect,
        } = user.toDTO();

        return {
            id: userId,
            firstname,
            lastname,
            roles,
            substituteTutorials: user.getSubstituteInformation(),
            hasTemporaryPassword: !!temporaryPassword,
            tutorials,
            tutorialsToCorrect,
        };
    }

    /**
     * @returns The name of all users with the `TUTOR` role in the database.
     */
    async getNamesOfAllTutors(): Promise<NamedElement[]> {
        const users = await this.findAll();

        return users
            .filter((u) => u.roles.includes(Role.TUTOR))
            .map<NamedElement>(({ id, firstname, lastname }) => ({
                id,
                firstname,
                lastname,
            }));
    }

    /**
     * Creates a new user based on the given information.
     *
     * This function also updates all related tutorials which the user is tutor or corrector of.
     *
     * @param user Information about the user to create.
     *
     * @returns Created UserDocument.
     * @throws `BadRequestException` - If the DTO is invalid  a BadRequestException is thrown. More information: See function `checkUserDTO()`.
     */
    private async createUser(user: CreateUserDTO): Promise<User> {
        await this.checkUserDTO(user);
        const {
            tutorials: tutorialIds,
            tutorialsToCorrect: toCorrectIds,
            password,
            username,
            ...dto
        } = user;

        const [tutorials, tutorialsToCorrect] = await Promise.all([
            this.getAllTutorials(tutorialIds),
            this.getAllTutorials(toCorrectIds),
        ]);
        const userEntity: User = new User({ ...dto, username, password });
        userEntity.temporaryPassword = password;
        userEntity.tutorials.add(...tutorials);
        userEntity.tutorialsToCorrect = new Collection<Tutorial, unknown>(
            userEntity,
            tutorialsToCorrect
        );

        return userEntity;
    }

    /**
     * Checks if there is already a user with the given username saved in the database. If a `user` is provided that user is ignored during the check.
     *
     * @param username Username to check
     * @param user (optional) User object which is allowed to have that username.
     * @returns Is there already a user with that username?
     */
    private async doesUserWithUsernameExist(username: string, user?: User): Promise<boolean> {
        const usersWithUsername: User[] = await this.getAllUsersWithUsername(username);

        if (!user) {
            return usersWithUsername.length > 0;
        }

        for (const sameUsernameUser of usersWithUsername) {
            if (sameUsernameUser.id !== user.id) {
                return true;
            }
        }

        return false;
    }

    /**
     * Returns the user with the given username.
     *
     * If there is no user with that username a `NotFoundException` is thrown.
     *
     * @param username Username to search for.
     *
     * @returns User with that username.
     *
     * @throws `NotFoundException` - If there is no user with that username.
     */
    private async getUserWithUsername(username: string): Promise<User> {
        const usersWithUserName = await this.getAllUsersWithUsername(username);
        const user = usersWithUserName[0];

        if (!user) {
            throw new NotFoundException(`User with username "${username}" was not found`);
        }

        await this.repository.populate(user, true);
        return user;
    }

    /**
     *
     * @param username Username to get users for.
     * @returns All users with that username. Array is empty if there are no users with that username.
     *
     * @private
     */
    private async getAllUsersWithUsername(username: string): Promise<User[]> {
        const allUsers = await this.repository.findAll({ populate: false });
        return allUsers.filter((u) => u.username === username);
    }

    /**
     * Helper to retrieve all TutorialDocument of the given IDs.
     *
     * All tutorials will be fetched in parallel with a `Promise.all` collecting them all. The tutorials retrieved will match the order of their provided IDs.
     *
     * @param ids IDs of the tutorials.
     *
     * @returns Tutorials matching the given IDs.
     */
    private async getAllTutorials(ids: string[]): Promise<Tutorial[]> {
        return this.tutorialService.findMultiple(ids);
    }

    /**
     * Checks if some more complex conditions apply to the given DTO:
     *
     * - There is no _other_ user with the `username`.
     * - If the user has `tutorials` he/she needs the TUTOR role aswell.
     * - If the user has `tutorialsToCorrect` he/she needs the CORRECTOR role aswell.
     *
     * If all conditions apply nothing happens else an exception is thrown.
     *
     * @param dto DTO with information to create / update a user
     * @param user (optional) User with the same username as the one to check. Should be provided to prevent false positives on updating an already existing user.
     *
     * @throws `BadRequestException` - If _any_ of the above conditions is violated a `BadRequestException` is thrown.
     */
    private async checkUserDTO(
        { tutorials, tutorialsToCorrect, username, roles }: UserDTO,
        user?: User
    ) {
        if (await this.doesUserWithUsernameExist(username, user)) {
            throw new BadRequestException(`A user with the username '${username}' already exists.`);
        }

        if (tutorials.length > 0 && !roles.includes(Role.TUTOR)) {
            throw new BadRequestException(`A user with tutorials needs to have the 'TUTOR' role`);
        }

        if (tutorialsToCorrect.length > 0 && !roles.includes(Role.CORRECTOR)) {
            throw new BadRequestException(
                `A user with tutorials to correct needs to have the 'CORRECTOR' role`
            );
        }
    }

    /**
     * Checks if the user can be safely updated.
     *
     * A user is considered not NOT updatable if
     * - It is the last user holding the ADMIN role and that role would get removed during the update.
     *
     * @param user User which should get updated.
     * @param dto New data of the user if it would get updated.
     *
     * @throws `BadRequestException` - If the user is considered _NOT_ updatable.
     */
    private async assertUserIsChangeable(user: User, dto: UserDTO) {
        if (user.roles.includes(Role.ADMIN) && !dto.roles.includes(Role.ADMIN)) {
            const allUsers = await this.findAll();
            const adminUsers = allUsers.filter((u) => u.roles.includes(Role.ADMIN));

            if (adminUsers.length <= 1) {
                throw new BadRequestException('ERR_REMOVE_LAST_ADMIN_ROLE');
            }
        }
    }

    /**
     * Checks if the user can be safely deleted.
     *
     * A user is considered NOT deletable if
     * - It is the last user holding the ADMIN role.
     *
     * @param user User to check.
     *
     * @throws `BadRequestException` - If the user is the last admin.
     */
    private async assertUserIsDeletable(user: User) {
        if (user.roles.includes(Role.ADMIN)) {
            const allUsers = await this.findAll();
            const adminUsers = allUsers.filter((u) => u.roles.includes(Role.ADMIN));

            // Do NOT allow deleting the last admin.
            if (adminUsers.length <= 1) {
                throw new BadRequestException('ERR_DELETE_LAST_ADMIN');
            }
        }
    }
}
