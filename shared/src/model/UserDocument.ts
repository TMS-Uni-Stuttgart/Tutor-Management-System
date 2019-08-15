import { Typegoose, prop } from 'typegoose';
import { OmitTypegoose } from './TypeHelpers';
import { Role } from './Role';

class UserModel extends Typegoose {
  @prop()
  firstname: string;

  @prop()
  lastname: string;

  @prop()
  roles: Role[];

  @prop()
  temporaryPassword: string;

  @prop()
  tutorials: string[];

  @prop()
  username: string;

  @prop()
  password: string;
}

const UserDocument = new UserModel().getModelForClass(UserModel);

// const UserDocument = mongoose.model<User>('User', UserSchema);

export type User = OmitTypegoose<UserModel>;
export default UserDocument;
