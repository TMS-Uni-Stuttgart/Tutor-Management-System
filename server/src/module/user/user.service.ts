import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { CreateUserDTO, User } from 'src/shared/model/User';
import { UserCredentials } from '../../auth/auth.model';
import { TutorialDocument } from '../models/tutorial.model';
import { UserDocument, UserModel } from '../models/user.model';
import { TutorialService } from '../tutorial/tutorial.service';

@Injectable()
export class UserService {
  constructor(
    private readonly tutorialService: TutorialService,
    @InjectModel(UserModel) private readonly userModel: ReturnModelType<typeof UserModel>
  ) {}

  /**
   * Returns all users saved in the database.
   */
  async findAll(): Promise<User[]> {
    const users = (await this.userModel.find().exec()) as UserDocument[];

    return users.map(user => user.toDTO());
  }

  /**
   * Returns the credentials of the user with the given username.
   *
   * If no user with that username exists a `NotFoundException` is thrown.
   *
   * @param username Username to search
   *
   * @returns UserCredentials of the user.
   *
   * @throws `NotFoundException` - If no user could be found
   */
  async findWithUsername(username: string): Promise<UserCredentials> {
    const user = await this.getUserWithUsername(username);

    return { _id: user.id, username: user.username, password: user.password };
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

    if (await this.doesUserWithUsernameExist(username)) {
      throw new BadRequestException(`A user with the username '${username}' already exists.`);
    }

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
  private async doesUserWithUsernameExist(username: string): Promise<boolean> {
    try {
      const user = await this.getUserWithUsername(username);

      return !!user;
    } catch {
      return false;
    }
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
    const docWithEncryptedUsername: UserDocument = new this.userModel({
      username,
    }) as UserDocument;

    docWithEncryptedUsername.encryptFieldsSync();

    // The find query is done with the encrypted version of the username.
    const userDoc = await this.userModel
      .findOne({
        username: docWithEncryptedUsername.username,
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
}
