import { model, Model, Schema } from 'mongoose';
import { User } from 'shared/dist/model/User';
import { CreateMongooseModel as CreateMongooseDocument } from './TypeHelpers';
import uuid = require('uuid/v4');

export interface UserCredentials {
  _id: string;
  username: string;
  password: string;
}

export type UserDocument = CreateMongooseDocument<User & { password: string }>;

const UserSchema: Schema<UserDocument> = new Schema({
  _id: { type: String, default: uuid },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  roles: { type: [String], required: true },
  temporaryPassword: String,
  tutorials: { type: [String], required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
});

const UserModel: Model<UserDocument> = model<UserDocument>('User', UserSchema);

export default UserModel;
