import bcrypt from 'bcrypt';
import { Role } from 'shared/dist/model/Role';
import { CreateUserDTO, User, LoggedInUser } from 'shared/dist/model/User';
import UserModel, { UserDocument, UserCredentials } from '../model/UserDocument';
import uuid = require('uuid/v4');
import { LoggedInUserDTO } from '../model/dtos/LoggedInUserDTO';
import TutorialModel from '../model/TutorialDocument';
import { SchemaName, getCollectionNameOfSchema } from '../model/SchemaName';

class UserService {
  public async getAllUsers(): Promise<User[]> {
    const userDocuments: UserDocument[] = await UserModel.find();
    const users: User[] = [];

    for (const doc of userDocuments) {
      users.push(await this.getUserOrReject(doc));
    }

    return users;
  }

  public async getUserWithId(id: string): Promise<User> {
    const user: UserDocument | null = await UserModel.findById(id).populate(
      getCollectionNameOfSchema(SchemaName.TUTORIAL)
    );

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
      getCollectionNameOfSchema(SchemaName.TUTORIAL)
    );

    if (!user) {
      return Promise.reject('User document not found.');
    }

    return user;
  }

  private async getUserOrReject(user: UserDocument | null): Promise<User> {
    if (!user) {
      return Promise.reject('User not found.');
    }

    const { _id, firstname, lastname, roles, tutorials, temporaryPassword, username } = user;

    return {
      id: _id,
      username,
      firstname,
      lastname,
      roles,
      tutorials: tutorials.map(t => t.id),
      temporaryPassword,
    };
  }

  public async initAdmin() {
    try {
      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash('admin', salt);
      const admin: CreateUserDTO = {
        firstname: 'admin',
        lastname: 'admin',
        roles: [Role.ADMIN],
        tutorials: [],
        username: 'admin',
        password,
      };

      const tutorialDocument = new TutorialModel({ slot: 1 });
      const adminDocument = new UserModel({ ...admin, tutorials: [tutorialDocument] });

      tutorialDocument.save();
      adminDocument.save();
    } catch (err) {
      throw err;
    }
  }
}

const userService = new UserService();

export default userService;
