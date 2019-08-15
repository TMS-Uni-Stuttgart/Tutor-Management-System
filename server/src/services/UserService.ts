import bcrypt from 'bcrypt';
import UserDocument, { UserModel } from '../model/UserDocument';
import uuid = require('uuid/v4');
import { Role } from 'shared/dist/model/Role';
import { CreateUserDTO, User } from 'shared/dist/model/User';

class UserService {
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
      const adminDocument = new UserDocument({ ...admin });

      adminDocument.save();
    } catch (err) {
      throw err;
    }
  }

  public async getUserWithId(id: string): Promise<UserModel> {
    const user: UserModel | null = await UserDocument.findById(id);

    return this.getUserOrReject(user);
  }

  public async getUserWithUsername(username: string): Promise<UserModel | null> {
    const user: UserModel | null = await UserDocument.findOne({ username });

    return this.getUserOrReject(user);
  }

  private async getUserOrReject(user: UserModel | null): Promise<UserModel> {
    return user || Promise.reject('User not found.');
  }

  private async convertDocumentToUser(user: UserModel | null): Promise<User> {
    if (!user) {
      return Promise.reject('User not found');
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
}

const userService = new UserService();

export default userService;
