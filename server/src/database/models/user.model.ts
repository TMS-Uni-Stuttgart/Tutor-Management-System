import {
  arrayProp,
  DocumentType,
  modelOptions,
  plugin,
  pre,
  prop,
  post,
} from '@typegoose/typegoose';
import bcrypt from 'bcryptjs';
import mongooseAutopopulate from 'mongoose-autopopulate';
import { EncryptedDocument, fieldEncryption } from 'mongoose-field-encryption';
import { Role } from 'src/shared/model/Role';
import { CollectionName } from '../../helpers/CollectionName';
import { databaseConfig } from '../../helpers/config';
import { NoFunctions } from '../../helpers/NoFunctions';
import { User } from '../../shared/model/User';
import { TutorialDocument } from './tutorial.model';
import VirtualPopulation, { VirtualPopulationOptions } from '../plugins/VirtualPopulation';

/**
 * Populates the fields in the given UserDocument. If no document is provided this functions does nothing.
 *
 * @param doc UserDocument to populate.
 */
export async function populateUserDocument(doc?: UserDocument) {
  if (!doc) {
    return;
  }

  await doc
    .populate('tutorials')
    .populate('tutorialsToCorrect')
    .execPopulate();
}

@plugin(fieldEncryption, {
  secret: databaseConfig.secret,
  fields: ['firstname', 'lastname', 'temporaryPassword', 'password', 'email'],
  // saltGenerator: function(secret: string) {
  // TODO: Make deterministic salt generator to be able to encrypt username?! If so, change `getUserWithUsername()` in UserService
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
@plugin<VirtualPopulationOptions<UserModel>>(VirtualPopulation, {
  populateDocument: populateUserDocument as any,
})
@modelOptions({ schemaOptions: { collection: CollectionName.USER, toObject: { virtuals: true } } })
export class UserModel {
  constructor(fields: NoFunctions<UserModel>) {
    Object.assign(this, fields);
  }

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

  @arrayProp({
    ref: 'TutorialModel',
    foreignField: 'tutor',
    localField: '_id',
  })
  tutorials!: TutorialDocument[];

  // @arrayProp({ default: [], autopopulate: true, ref: 'TutorialModel' })
  @arrayProp({
    ref: 'TutorialModel',
    foreignField: 'correctors',
    localField: '_id',
  })
  tutorialsToCorrect!: TutorialDocument[];

  /**
   * @returns The DTO representation of the document.
   */
  toDTO(this: UserDocument): User {
    this.decryptFieldsSync();

    const {
      id,
      username,
      firstname,
      lastname,
      roles,
      email,
      temporaryPassword,
      tutorials,
      tutorialsToCorrect,
    } = this;

    return {
      id,
      username,
      firstname,
      lastname,
      roles,
      email,
      temporaryPassword,
      tutorials: tutorials.map(tutorial => tutorial.id),
      tutorialsToCorrect: tutorialsToCorrect.map(tutorial => tutorial.id),
    };
  }
}

export type UserDocument = EncryptedDocument<DocumentType<UserModel>>;
