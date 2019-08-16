import { model, Model, Schema } from 'mongoose';
import { User } from 'shared/dist/model/User';
import uuid from 'uuid/v4';
import { SchemaName } from './SchemaName';
import { CreateMongooseModel as CreateMongooseDocument } from './TypeHelpers';
import { Tutorial } from 'shared/dist/model/Tutorial';

export class UserCredentials {
  constructor(readonly _id: string, readonly username: string, readonly password: string) {}
}

interface InternalUser extends Omit<User, 'tutorials'> {
  tutorials: Tutorial[];
  password: string;
}

export type UserDocument = CreateMongooseDocument<InternalUser>;

const UserSchema: Schema<UserDocument> = new Schema({
  _id: { type: String, default: uuid },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  roles: { type: [String], required: true },
  temporaryPassword: String,
  tutorials: [{ type: Schema.Types.String, ref: SchemaName.TUTORIAL }],
  username: { type: String, required: true },
  password: { type: String, required: true },
});

const UserModel: Model<UserDocument> = model<UserDocument>(SchemaName.USER, UserSchema);

export default UserModel;
