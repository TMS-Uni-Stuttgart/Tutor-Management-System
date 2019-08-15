import { model, Model, Schema, Document } from 'mongoose';
import { CreateMongooseModel } from './TypeHelpers';
import { User } from 'shared/dist/model/User';
import uuid = require('uuid/v4');

export type UserModel = CreateMongooseModel<User & { password: string }>;

const UserSchema: Schema<UserModel> = new Schema({
  _id: { type: String, default: uuid },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  roles: { type: [String], required: true },
  temporaryPassword: String,
  tutorials: { type: [String], required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
});

const UserDocument: Model<UserModel> = model<UserModel>('User', UserSchema);

export default UserDocument;
