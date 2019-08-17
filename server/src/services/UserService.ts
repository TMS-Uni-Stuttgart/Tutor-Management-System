import { Role } from 'shared/dist/model/Role';
import { CreateUserDTO, LoggedInUser, User, UserDTO } from 'shared/dist/model/User';
import { getIdOfDocumentRef } from '../helpers/documentHelpers';
import { CollectionName } from '../model/CollectionName';
import TutorialModel from '../model/documents/TutorialDocument';
import UserModel, { UserCredentials, UserDocument } from '../model/documents/UserDocument';
import { LoggedInUserDTO } from '../model/dtos/LoggedInUserDTO';
import { DocumentNotFoundError } from '../model/Errors';

class UserService {
  public async getAllUsers(): Promise<User[]> {
    const userDocuments: UserDocument[] = await UserModel.find();
    const users: User[] = [];

    for (const doc of userDocuments) {
      users.push(await this.getUserOrReject(doc));
    }

    return users;
  }

  public async createUser(dto: CreateUserDTO): Promise<User> {
    const createdUser = await UserModel.create({ ...dto });

    return this.getUserOrReject(createdUser);
  }

  public async updateUser(id: string, dto: UserDTO): Promise<User> {
    const user: UserDocument = await this.getUserDocumentWithId(id);

    // TODO: Remove user from tutorial(s) -- needed with references??
    // TODO: Readd user to new tutorial(s) -- needed with references??

    await user.updateOne({ ...dto });
    const updatedUser = await this.getUserDocumentWithId(id);

    return this.getUserOrReject(updatedUser);
  }

  public async deleteUser(id: string): Promise<void> {
    const user: UserDocument = await this.getUserDocumentWithId(id);

    user.remove();
  }

  public async getUserWithId(id: string): Promise<User> {
    const user: UserDocument | null = await this.getUserDocumentWithId(id);

    return this.getUserOrReject(user);
  }

  public async getUserCredentialsWithUsername(username: string): Promise<UserCredentials> {
    const user: UserDocument | null = await UserModel.findOne({ username });

    if (!user) {
      return Promise.reject('User not found.');
    }

    return new UserCredentials(user._id, user.username, user.password);
  }

  public async getLoggedInUserInformation({ _id }: UserCredentials): Promise<LoggedInUser> {
    const user: UserDocument = await this.getUserDocumentWithId(_id);

    // TODO: Add substitute Tutorials
    // TODO: Add corrector tutorials

    return new LoggedInUserDTO(user, []);
  }

  private async getUserDocumentWithId(id: string): Promise<UserDocument> {
    const user: UserDocument | null = await UserModel.findById(id).populate(
      CollectionName.TUTORIAL
    );

    if (!user) {
      return this.rejectUserNotFound();
    }

    return user;
  }

  private async getUserOrReject(user: UserDocument | null): Promise<User> {
    if (!user) {
      return this.rejectUserNotFound();
    }

    const { _id, firstname, lastname, roles, tutorials, temporaryPassword, username } = user;

    return {
      id: _id,
      username,
      firstname,
      lastname,
      roles,
      tutorials: tutorials.map(getIdOfDocumentRef),
      temporaryPassword,
    };
  }

  private async rejectUserNotFound(): Promise<any> {
    return Promise.reject(new DocumentNotFoundError('User with that ID was not found.'));
  }

  public async initAdmin() {
    try {
      const tutorialDocument = await TutorialModel.create({
        slot: 1,
        tutor: undefined,
        dates: [],
        startTime: new Date(Date.now()),
        endTime: new Date(Date.now()),
        students: [],
        correctors: [],
        teams: [],
        substitutes: {},
      });

      const admin: CreateUserDTO = {
        firstname: 'admin',
        lastname: 'admin',
        roles: [Role.ADMIN],
        tutorials: [tutorialDocument._id],
        username: 'admin',
        password: 'admin',
      };

      return this.createUser(admin);
    } catch (err) {
      throw err;
    }
  }
}

const userService = new UserService();

export default userService;
