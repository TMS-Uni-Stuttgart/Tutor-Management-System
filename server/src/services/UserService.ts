import bcrypt from 'bcrypt';
import UserDocument, { User, UserModel } from '../model/UserDocument';
import uuid = require('uuid/v4');
import { Role } from '../model/Role';

class UserService {
  public async initAdmin() {
    try {
      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash('admin', salt);
      const admin: User = {
        id: uuid(),
        firstname: 'admin',
        lastname: 'admin',
        roles: [Role.ADMIN],
        temporaryPassword: '',
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

  public async getUserWithId(id: string): Promise<User> {
    const user: UserModel | null = await UserDocument.findById(id);

    return this.convertDocumentToUser(user);
  }

  public async getUserWithUsername(username: string): Promise<User> {
    const user: UserModel | null = await UserDocument.findOne({ username });

    return this.convertDocumentToUser(user);
  }

  private async convertDocumentToUser(user: UserModel | null): Promise<User> {
    if (!user) {
      return Promise.reject('User not found');
    }

    const {
      firstname,
      lastname,
      roles,
      tutorials,
      temporaryPassword,
      username,
      password,
      _id,
    } = user;

    return {
      id: _id,
      username,
      password,
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
