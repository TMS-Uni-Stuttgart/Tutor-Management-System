import bcrypt from 'bcryptjs';
import config from 'config';
import { Document, Model } from 'mongoose';
import { fieldEncryption } from 'mongoose-field-encryption';
import { Role } from 'shared/dist/model/Role';
import { User } from 'shared/dist/model/User';
import { arrayProp, plugin, pre, prop, Ref, Typegoose } from 'typegoose';
import databaseConfig, { DatabaseConfig } from '../../config/database';
import { CollectionName } from '../CollectionName';
import { TutorialDocument } from './TutorialDocument';

export class UserCredentials {
  constructor(readonly _id: string, readonly username: string, readonly password: string) {}
}

@plugin(fieldEncryption, {
  secret: databaseConfig.secret,
  fields: ['firstname', 'lastname', 'temporaryPassword', 'password'],
  // saltGenerator: function(secret: string) {
  // TODO: Make deterministic salt generator to be able to encrypt username?!
  //   return "1234567890123456"; // should ideally use the secret to return a string of length 16
  // }
})
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
  firstname!: string;

  @prop({ required: true })
  lastname!: string;

  @arrayProp({ required: true, items: String })
  roles!: Role[];

  @prop({ required: true })
  username!: string;

  @prop({ default: '' })
  temporaryPassword?: string;

  @arrayProp({ required: true, itemsRef: { name: 'TutorialSchema' } })
  tutorials!: Ref<TutorialDocument>[];

  @prop({ required: true })
  password!: string;
}

export interface UserDocument extends UserSchema, Document {}

const UserModel: Model<UserDocument> = new UserSchema().getModelForClass(UserSchema, {
  schemaOptions: { collection: CollectionName.USER },
});

export default UserModel;
