import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { CreateUserDTO, User, UserDTO } from 'src/shared/model/User';
import { UserCredentialsWithPassword } from '../../auth/auth.model';
import { Role } from '../../shared/model/Role';
import { TutorialDocument } from '../models/tutorial.model';
import { UserDocument, UserModel } from '../models/user.model';
import { TutorialService } from '../tutorial/tutorial.service';
import { ServiceInterface } from '../../helpers/ServiceInterface';

@Injectable()
export class UserService implements OnModuleInit, ServiceInterface<User, UserDTO, UserDocument> {
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

    return users.map(user => user.toDTO());
  }

  async findById(id: string): Promise<UserDocument> {
    const user = (await this.userModel.findById(id).exec()) as UserDocument;

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

    await this.checkCreateUserDTO(user);

    const tutorials = await this.getAllTutorials(tutorialIds);
    const tutorialsToCorrect = await this.getAllTutorials(toCorrectIds);

    const userDocument: UserModel = new UserModel({
      ...dto,
      username,
      password,
      temporaryPassword: password,
      tutorials,
      tutorialsToCorrect,
    });

    const result = (await this.userModel.create(userDocument)) as UserDocument;

    return result.toDTO();
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

    // TODO: Does not work if the username got changed during the request. This needs some other logic!

    return !!user ? usersWithUsername.length > 1 : usersWithUsername.length !== 0;
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
  private async checkCreateUserDTO(
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
