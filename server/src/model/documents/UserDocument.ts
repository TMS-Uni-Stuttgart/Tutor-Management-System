import bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import encrypt from 'mongoose-encryption';
import { Role } from 'shared/dist/model/Role';
import { User } from 'shared/dist/model/User';
import { arrayProp, plugin, pre, prop, Ref, Typegoose } from 'typegoose';
import { CollectionName } from '../CollectionName';
import { CreateMongooseModel as CreateMongooseDocument } from '../TypeHelpers';
import { TutorialDocument, TutorialSchema } from './TutorialDocument';
import databaseConfig from '../../config/database';

export class UserCredentials {
  constructor(readonly _id: string, readonly username: string, readonly password: string) {}
}

// @plugin(encrypt, {
//   secret: databaseConfig.secret,
//   encryptedFields: ['firstname', 'lastname', 'temporaryPassword', 'password'],
// })
@pre<UserDocument>('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);

  this.password = hashedPassword;
  next();
})
export class UserSchema extends Typegoose implements Omit<User, 'id' | 'tutorials'> {
  @prop({ required: true })
  firstname: string;

  @prop({ required: true })
  lastname: string;

  @arrayProp({ required: true, items: String })
  roles: Role[];

  @prop({ required: true })
  username: string;

  @prop({ default: '' })
  temporaryPassword: string;

  @arrayProp({ required: true, itemsRef: { name: TutorialSchema } })
  tutorials: Ref<TutorialDocument>[];

  @prop({ required: true })
  password: string;
}

export type UserDocument = CreateMongooseDocument<UserSchema>;

const UserModel: Model<UserDocument> = new UserSchema().getModelForClass(UserSchema, {
  schemaOptions: { collection: CollectionName.USER },
});

export default UserModel;
