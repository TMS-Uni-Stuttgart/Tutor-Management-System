import { Injectable, NotFoundException } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { User, UserDTO } from 'src/shared/model/User';
import { UserDocument, UserModel } from './user.model';
import { UserCredentials } from '../../auth/auth.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserModel) private readonly userModel: ReturnModelType<typeof UserModel>
  ) {}

  async findAll(): Promise<User[]> {
    const users = (await this.userModel.find().exec()) as UserDocument[];

    return users.map(this.sanitizeUser);
  }

  async findWithUsername(username: string): Promise<UserCredentials> {
    const user = await this.getUserWithUsername(username);

    return { _id: user.id, username: user.username, password: user.password };
  }

  async create(user: UserDTO): Promise<User> {
    const createdUser = new this.userModel(user);
    const result = (await createdUser.save()) as UserDocument;

    return this.sanitizeUser(result);
  }

  private async getUserWithUsername(username: string): Promise<UserDocument> {
    // The username field could be encrypted so we create a dummy document which will have the username encrypted (if the 'original' ones have it encrypted aswell).
    const docWithEncryptedUsername: UserDocument = new this.userModel({
      username,
    }) as UserDocument;

    docWithEncryptedUsername.encryptFieldsSync();

    // The find query is done with the encrypted version of the username.
    const userDocs = await this.userModel
      .findOne({
        username: docWithEncryptedUsername.username,
      })
      .exec();

    if (!userDocs) {
      throw new NotFoundException(`User with username "${username}" was not found`);
    }

    return userDocs as UserDocument;
  }

  private sanitizeUser(user: UserDocument): User {
    user.decryptFieldsSync();

    const { id, username, firstname, lastname, roles, email } = user;

    return {
      id,
      username,
      firstname,
      lastname,
      roles,
      email,
      tutorials: [],
      tutorialsToCorrect: [],
    };
  }
}
