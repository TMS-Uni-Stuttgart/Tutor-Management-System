import {
    BadRequestException,
    forwardRef,
    Inject,
    Injectable,
    Logger,
    NotFoundException,
    OnModuleInit,
} from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { DateTime } from 'luxon';
import { InjectModel } from 'nestjs-typegoose';
import { ILoggedInUser, ILoggedInUserSubstituteTutorial, IUser } from 'shared/model/User';
import { NamedElement } from 'shared/model/Common';
import { Role } from 'shared/model/Role';
import { UserCredentialsWithPassword } from '../../auth/auth.model';
import { TutorialDocument } from '../../database/models/tutorial.model';
import { UserDocument, UserModel } from '../../database/models/user.model';
import { CRUDService } from '../../helpers/CRUDService';
import { TutorialService } from '../tutorial/tutorial.service';
import { CreateUserDTO, UserDTO } from './user.dto';

@Injectable()
export class UserService implements OnModuleInit, CRUDService<IUser, UserDTO, UserDocument> {
    constructor(
        @Inject(forwardRef(() => TutorialService))
        private readonly tutorialService: TutorialService,
        @InjectModel(UserModel)
        private readonly userModel: ReturnModelType<typeof UserModel>
    ) {}

    /**
     * Creates a new administrator on application start if there are no users present in the DB.
     */
    async onModuleInit(): Promise<void> {
        const users = await this.findAll();

        if (users.length === 0) {
            Logger.log(
                'No user present in the database. Creating a default administrator user...',
                UserService.name
            );

            await this.create({
                firstname: 'admin',
                lastname: 'admin',
                username: 'admin',
                password: 'admin',
                roles: [Role.ADMIN],
                tutorials: [],
                tutorialsToCorrect: [],
                email: '',
            });

            Logger.log('Default administrator created.', UserService.name);
        }
    }

    /**
     * @returns All users saved in the database.
     */
    async findAll(): Promise<UserDocument[]> {
        return (await this.userModel.find().exec()) as UserDocument[];
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
    async findById(id: string): Promise<UserDocument> {
        const user = (await this.userModel.findById(id).exec()) as UserDocument | null;

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

        return { _id: id, username, password, roles };
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
        const created: UserDocument[] = [];
        const errors: string[] = [];

        for (const user of users) {
            try {
                const doc = await this.createUser(user);
                created.push(doc);
            } catch (err: unknown) {
                let message: String;
                if (err instanceof Error) {
                    message = err.message;
                } else {
                    message = 'Unknown error';
                }
                errors.push(`[${user.lastname}, ${user.firstname}]: ${message}`);
            }
        }

        if (errors.length > 0) {
            await Promise.all(created.map((u) => u.remove()));
            throw new BadRequestException(errors);
        }

        return created.map((u) => u.toDTO());
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
        const { tutorials, tutorialsToCorrect } = user;

        await this.checkUserDTO(dto, user);
        await this.assertUserIsChangeable(user, dto);

        // Remove user as tutor from all tutorials he/she is not the tutor of anymore.
        await Promise.all(
            tutorials
                .filter((tut) => !dto.tutorials.includes(tut.id))
                .map((tutorial) => {
                    tutorial.tutor = undefined;
                    return tutorial.save();
                })
        );

        // Add user as tutor to all tutorials he/she is the tutor of.
        const idsOfTutorialsToAdd: string[] = dto.tutorials.filter(
            (id) => !tutorials.map((tut) => tut.id).includes(id)
        );
        const tutorialsToAdd = await this.getAllTutorials(idsOfTutorialsToAdd);

        await Promise.all(
            tutorialsToAdd.map((tutorial) => {
                tutorial.tutor = user;
                return tutorial.save();
            })
        );

        // Remove user from all tutorials to correct he's not the corrector of anymore.
        await Promise.all(
            tutorialsToCorrect
                .filter((tutorial) => !dto.tutorialsToCorrect.includes(tutorial.id))
                .map((tutorial) => {
                    tutorial.correctors = [
                        ...tutorial.correctors.filter((corrector) => corrector.id !== user.id),
                    ];

                    tutorial.markModified('correctors');
                    return tutorial.save();
                })
        );

        // Add user as corrector to all tutorials he's corrector of, now (old correctors stay).
        const idsOfTutorialsToCorrect = dto.tutorialsToCorrect.filter(
            (id) => !tutorialsToCorrect.map((t) => t.id).includes(id)
        );
        const additionalToCorrect = await this.getAllTutorials(idsOfTutorialsToCorrect);

        await Promise.all(
            additionalToCorrect.map((tutorial) => {
                tutorial.correctors.push(user);
                return tutorial.save();
            })
        );

        // We connot use mongooses's update(...) in an easy manner here because it would require us to set the '__enc_[FIELD]' properties of all encrypted fields to false manually! This is why all relevant field get updated here and 'save()' is used.
        user.firstname = dto.firstname;
        user.lastname = dto.lastname;
        user.username = dto.username;
        user.email = dto.email;
        user.roles = dto.roles;

        const updatedUser = await user.save();

        return updatedUser.toDTO();
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
    async delete(id: string): Promise<UserDocument> {
        const user = await this.findById(id);
        await this.assertUserIsDeletable(user);

        await Promise.all(
            user.tutorials.map((tutorial) => {
                tutorial.tutor = undefined;
                return tutorial.save();
            })
        );

        return user.remove();
    }

    /**
     * Sets the password of the given user to the given one. This will remove the `temporaryPassword` from the uesr.
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
    async setPassword(id: string, password: string): Promise<UserDocument> {
        const user = await this.findById(id);

        user.password = password;
        user.temporaryPassword = undefined;

        const updatedUser = await user.save();
        updatedUser.decryptFieldsSync();

        return updatedUser;
    }

    /**
     * Sets the password _and_ the temporary password of the user to the given one.
     *
     * If one only wants to set the password while removing the temporary one, one should use the `setPassword()` function.
     *
     * @param id ID of the user.
     * @param password (New) password.
     *
     * @returns Updated UserDocument
     *
     * @throws `NotFoundException` - If no user with the given ID could be found.
     */
    async setTemporaryPassword(id: string, password: string): Promise<UserDocument> {
        const user = await this.findById(id);

        user.password = password;
        user.temporaryPassword = password;

        const updatedUser = await user.save();
        updatedUser.decryptFieldsSync();

        return updatedUser;
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
        const allTutorials = await this.tutorialService.findAll();
        const {
            id: userId,
            firstname,
            lastname,
            roles,
            temporaryPassword,
            tutorials,
            tutorialsToCorrect,
        } = (await this.findById(id)).toDTO();

        const substituteTutorials: Map<string, ILoggedInUserSubstituteTutorial> = new Map();

        allTutorials.forEach((tutorial) => {
            tutorial.getAllSubstitutes().forEach((substituteId, dateKey) => {
                if (substituteId !== userId) {
                    return;
                }

                const date = DateTime.fromISO(dateKey).toISODate();
                const substInfo: ILoggedInUserSubstituteTutorial = substituteTutorials.get(
                    tutorial.id
                ) ?? {
                    ...tutorial.toInEntity(),
                    dates: [],
                };

                if (!date) {
                    throw new Error(`Date '${dateKey}' could not be parsed to an ISODate.`);
                }

                substInfo.dates.push(date);
                substituteTutorials.set(tutorial.id, substInfo);
            });
        });

        return {
            id: userId,
            firstname,
            lastname,
            roles,
            substituteTutorials: Array.of(...substituteTutorials.values()),
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
    private async createUser(user: CreateUserDTO): Promise<UserDocument> {
        await this.checkUserDTO(user);
        const {
            tutorials: tutorialIds,
            tutorialsToCorrect: toCorrectIds,
            password,
            username,
            ...dto
        } = user;
        const userDocument: UserModel = new UserModel({
            ...dto,
            username,
            password,
            temporaryPassword: password,
        });

        const [tutorials, tutorialsToCorrect] = await Promise.all([
            this.getAllTutorials(tutorialIds),
            this.getAllTutorials(toCorrectIds),
        ]);

        const result = (await this.userModel.create(userDocument)) as UserDocument;

        await this.updateTutorialsWithUser({
            tutor: result,
            tutorials,
            tutorialsToCorrect,
        });

        return this.findById(result.id);
    }

    /**
     * Sets the given `tutor` as tutor for all given `tutorials` and as corrector for all given `tutorialsToCorrect`.
     *
     * @param tutor Tutor or corrector to set as tutor of the `tutorials` and as corrector of the `tutorialsToCorrect`.
     * @param tutorials Tutorials to set the given `tutor` as tutor.
     * @param tutorialsToCorrect Tutorials to set the given `tutor` as corrector.
     */
    private async updateTutorialsWithUser({
        tutor,
        tutorials,
        tutorialsToCorrect,
    }: UpdateTutorialsParams): Promise<void> {
        await Promise.all(
            tutorials.map((tutorial) => {
                tutorial.tutor = tutor;
                return tutorial.save();
            })
        );

        await Promise.all(
            tutorialsToCorrect.map((tutorial) => {
                tutorial.correctors.push(tutor);
                return tutorial.save();
            })
        );
    }

    /**
     * Checks if there is already a user with the given username saved in the database.
     *
     * @param username Username to check
     * @param user (Optional) This user is allowed to have the given username.
     * @returns Is there already a user with that username?
     */
    private async doesUserWithUsernameExist(
        username: string,
        user?: UserDocument
    ): Promise<boolean> {
        const usersWithUsername: UserDocument[] = (await this.userModel
            .find({ username })
            .exec()) as UserDocument[];

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
    private async getUserWithUsername(username: string): Promise<UserDocument> {
        const userDoc = await this.userModel
            .findOne(
                {
                    username,
                },
                undefined,
                // Make sure that the query is case insensitive.
                { collation: { locale: 'en', strength: 2 } }
            )
            .exec();

        if (!userDoc) {
            throw new NotFoundException(`User with username "${username}" was not found`);
        }

        return userDoc as UserDocument;
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
    private async getAllTutorials(ids: string[]): Promise<TutorialDocument[]> {
        return Promise.all(ids.map((id) => this.tutorialService.findById(id)));
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
        user?: UserDocument
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
    private async assertUserIsChangeable(user: UserDocument, dto: UserDTO) {
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
    private async assertUserIsDeletable(user: UserDocument) {
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

interface UpdateTutorialsParams {
    tutor: UserDocument;
    tutorials: TutorialDocument[];
    tutorialsToCorrect: TutorialDocument[];
}
