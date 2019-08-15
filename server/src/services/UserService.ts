import bcrypt from 'bcrypt';
import UserDocument, { User } from 'shared/dist/model/UserDocument';

class UserService {
  public async initAdmin() {
    try {
      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash('admin', salt);

      const admin = new UserDocument({
        username: 'admin',
        password,
      });

      return admin.save();
    } catch (err) {
      throw err;
    }
  }

  public async getUserWithId(id: string): Promise<User> {
    const user: User | null = await UserDocument.findById(id);

    return user || Promise.reject('User not found');
  }

  public async getUserWithUsername(username: string): Promise<User> {
    const user: User | null = await UserDocument.findOne({ username });
    console.log(user);
    console.log(user._id);

    return user || Promise.reject('User not found');
  }
}

const userService = new UserService();

export default userService;
