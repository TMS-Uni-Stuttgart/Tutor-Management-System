import { model, Model, Schema } from 'mongoose';
import { NamedElement } from './Common';
import { Role } from './Role';
import { CreateMongooseModel } from './TypeHelpers';
import uuid = require('uuid/v4');

export interface User extends NamedElement {
  roles: Role[];
  temporaryPassword: string;
  tutorials: string[];
  username: string;
  password: string;
}

export type UserModel = CreateMongooseModel<User>;

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
