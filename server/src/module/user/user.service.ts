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
import { InjectModel } from 'nestjs-typegoose';
import { User } from 'src/shared/model/User';
import { UserCredentialsWithPassword } from '../../auth/auth.model';
import { CRUDService } from '../../helpers/CRUDService';
import { Role } from '../../shared/model/Role';
import { TutorialDocument } from '../../database/models/tutorial.model';
import { UserDocument, UserModel, populateUserDocument } from '../../database/models/user.model';
import { TutorialService } from '../tutorial/tutorial.service';
import { UserDTO, CreateUserDTO } from './user.dto';

@Injectable()
export class UserService implements OnModuleInit, CRUDService<User, UserDTO, UserDocument> {
  constructor(
    @Inject(forwardRef(() => TutorialService))
    private readonly tutorialService: TutorialService,
    @InjectModel(UserModel) private readonly userModel: ReturnModelType<typeof UserModel>
  ) {}

  /**
   * Creates a new administrator on application start if there are no users present in the DB.
   */
  async onModuleInit() {
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
  async findAll(): Promise<User[]> {
    const users = (await this.userModel.find().exec()) as UserDocument[];

    await Promise.all(users.map(doc => populateUserDocument(doc)));

    return users.map(user => user.toDTO());
  }

  /**
   * Searches for a user with the given ID and returns it's document if possible.
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
  async create(user: CreateUserDTO): Promise<User> {
    const {
      tutorials: tutorialIds,
      tutorialsToCorrect: toCorrectIds,
      password,
      username,
      ...dto
    } = user;

    await this.checkUserDTO(user);

    const tutorials = await this.getAllTutorials(tutorialIds);
    const tutorialsToCorrect = await this.getAllTutorials(toCorrectIds);

    const userDocument: UserModel = new UserModel({
      ...dto,
      username,
      password,
      temporaryPassword: password,
    });

    const result = (await this.userModel.create(userDocument)) as UserDocument;

    await Promise.all(
      tutorials.map(tutorial => {
        tutorial.tutor = result;
        return tutorial.save();
      })
    );

    await Promise.all(
      tutorialsToCorrect.map(tutorial => {
        tutorial.correctors.push(result);
        return tutorial.save();
      })
    );

    const createdUser = await this.findById(result.id);
    return createdUser.toDTO();
  }

  /**
   * Updates the user with the given information
   *
   * If neccessary this functions updates all related tutorials and saves them afterwards. Related tutorials can be:
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
  async update(id: string, dto: UserDTO): Promise<User> {
    const user = await this.findById(id);
    const { tutorials, tutorialsToCorrect } = user;

    await this.checkUserDTO(dto, user);

    // Remove user as tutor from all tutorials he/she is not the tutor of anymore.
    await Promise.all(
      tutorials
        .filter(tut => !dto.tutorials.includes(tut.id))
        .map(tutorial => {
          tutorial.tutor = undefined;
          return tutorial.save();
        })
    );

    // Add user as tutor to all tutorials he/she is the tutor of.
    const idsOfTutorialsToAdd: string[] = dto.tutorials.filter(
      id => !tutorials.map(tut => tut.id).includes(id)
    );
    const tutorialsToAdd = await this.getAllTutorials(idsOfTutorialsToAdd);

    await Promise.all(
      tutorialsToAdd.map(tutorial => {
        tutorial.tutor = user.id;
        return tutorial.save();
      })
    );

    // Remove user from all tutorial to correct he's not the corrector of anymore.
    await Promise.all(
      tutorialsToCorrect
        .filter(tutorial => !dto.tutorialsToCorrect.includes(tutorial.id))
        .map(tutorial => {
          tutorial.correctors = [
            ...tutorial.correctors.filter(corrector => corrector.id !== user.id),
          ];

          return tutorial.save();
        })
    );

    // Add user as corrector to all tutorials he's corrector of, now (old correctors stay).
    const idsOfTutorialsToCorrect = dto.tutorialsToCorrect.filter(
      id => !tutorialsToCorrect.map(t => t.id).includes(id)
    );
    const additionalToCorrect = await this.getAllTutorials(idsOfTutorialsToCorrect);

    await Promise.all(
      additionalToCorrect.map(tutorial => {
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
   * @throws `NotFoundExceotion` - If there is no user with such an ID.
   */
  async delete(id: string): Promise<UserDocument> {
    const user = await this.findById(id);

    await Promise.all(
      user.tutorials.map(tutorial => {
        tutorial.tutor = undefined;
        return tutorial.save();
      })
    );

    return user.remove();
  }

  /**
   * Checks if there is already a user with the given username saved in the database.
   *
   * @param username Username to check
   * @returns Is there already a user with that username?
   */
  private async doesUserWithUsernameExist(username: string, user?: UserDocument): Promise<boolean> {
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
    // The username field could be encrypted so we create a dummy document which will have the username encrypted (if the 'original' ones have it encrypted aswell).
    // const docWithEncryptedUsername: UserDocument = new this.userModel({
    //   username,
    // }) as UserDocument;

    // docWithEncryptedUsername.encryptFieldsSync();

    const userDoc = await this.userModel
      .findOne({
        username,
      })
      .exec();

    if (!userDoc) {
      throw new NotFoundException(`User with username "${username}" was not found`);
    }

    return userDoc as UserDocument;
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
   * Helper to retrieve all TutorialDocument of the given IDs.
   *
   * All tutorials will be fetched in parallel with a `Promise.all` collecting them all. The tutorials retrieved will match the order of their provided IDs.
   *
   * @param ids IDs of the tutorials.
   *
   * @returns Tutorials matching the given IDs.
   */
  private async getAllTutorials(ids: string[]): Promise<TutorialDocument[]> {
    return Promise.all(ids.map(id => this.tutorialService.findById(id)));
  }

  /**
   * Checks if the some more complex conditions apply to the given DTO:
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
}
