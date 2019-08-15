import bcrypt from 'bcrypt';
import { Role } from 'shared/dist/model/Role';
import { CreateUserDTO, User } from 'shared/dist/model/User';
import UserModel, { UserDocument, UserCredentials } from '../model/UserDocument';
import uuid = require('uuid/v4');

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
    const user: UserDocument | null = await UserModel.findById(id);

    return this.getUserOrReject(user);
  }

  public async getUserCredentialsWithUsername(username: string): Promise<UserCredentials> {
    const user: UserDocument | null = await UserModel.findOne({ username });

    if (!user) {
      return Promise.reject('User not found.');
    }

    return { _id: user._id, username: user.username, password: user.password };
  }

  private async getUserOrReject(user: UserDocument | null): Promise<User> {
    if (!user) {
      return Promise.reject('User not found.');
    }

    const { firstname, lastname, roles, tutorials, temporaryPassword, username, _id } = user;

    return {
      id: _id,
      username,
      firstname,
      lastname,
      roles,
      tutorials,
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
      const adminDocument = new UserModel({ ...admin });

      adminDocument.save();
    } catch (err) {
      throw err;
    }
  }
}

const userService = new UserService();

export default userService;
