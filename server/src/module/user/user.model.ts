import { arrayProp, DocumentType, modelOptions, plugin, pre, prop } from '@typegoose/typegoose';
import bcrypt from 'bcryptjs';
import mongooseAutopopulate from 'mongoose-autopopulate';
import { EncryptedDocument, fieldEncryption } from 'mongoose-field-encryption';
import { Role } from 'src/shared/model/Role';
import { databaseConfig } from '../../helpers/config';
import { TutorialDocument } from '../tutorial/tutorial.model';
import { CollectionName } from '../../helpers/CollectionName';

@plugin(fieldEncryption, {
  secret: databaseConfig.secret,
  fields: ['firstname', 'lastname', 'temporaryPassword', 'password', 'email'],
  // saltGenerator: function(secret: string) {
  // TODO: Make deterministic salt generator to be able to encrypt username?!
  //   return "1234567890123456"; // should ideally use the secret to return a string of length 16
  // }
})
@plugin(mongooseAutopopulate)
@pre<UserModel>('save', async function(next) {
  const isHashed = /^\$2[ayb]\$.{56}$/.test(this.password);

  if (isHashed) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);

  this.password = hashedPassword;
  next();
})
@modelOptions({ schemaOptions: { collection: CollectionName.USER } })
export class UserModel {
  @prop({ required: true })
  firstname!: string;

  @prop({ required: true })
  lastname!: string;

  @arrayProp({ required: true, items: String })
  roles!: Role[];

  @prop({ required: true, unique: true })
  username!: string;

  @prop({ required: true })
  password!: string;

  @prop({ default: '' })
  email!: string;

  @prop()
  temporaryPassword?: string;

  @arrayProp({ required: true, autopopulate: true, ref: 'TutorialModel' })
  tutorials!: TutorialDocument[];

  @arrayProp({ default: [], autopopulate: true, ref: 'TutorialModel' })
  tutorialsToCorrect!: TutorialDocument[];
}

export type UserDocument = EncryptedDocument<DocumentType<UserModel>>;
