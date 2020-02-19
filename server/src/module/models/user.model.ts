import { arrayProp, DocumentType, modelOptions, plugin, pre, prop } from '@typegoose/typegoose';
import bcrypt from 'bcryptjs';
import mongooseAutopopulate from 'mongoose-autopopulate';
import { EncryptedDocument, fieldEncryption } from 'mongoose-field-encryption';
import { Role } from 'src/shared/model/Role';
import { CollectionName } from '../../helpers/CollectionName';
import { databaseConfig } from '../../helpers/config';
import { NoFunctions } from '../../helpers/NoFunctions';
import { User } from '../../shared/model/User';
import { TutorialDocument } from './tutorial.model';

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
@modelOptions({ schemaOptions: { collection: CollectionName.USER } })
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

  @arrayProp({ required: true, autopopulate: true, ref: 'TutorialModel' })
  tutorials!: TutorialDocument[];

  @arrayProp({ default: [], autopopulate: true, ref: 'TutorialModel' })
  tutorialsToCorrect!: TutorialDocument[];

  /**
   * Adds the given tutorial to this user.
   *
   * If the user is not already the tutor of the given tutorial it will get added to it's `tutorials` list. Afterwards the document is saved.
   * Else the operation will not change anything.
   *
   * @param tutorial Tutorial to add to this user.
   *
   * @returns If the tutorial got added the `save()` promise is returned. Else `undefined` is returned.
   */
  async addTutorial(this: UserDocument, tutorial: TutorialDocument) {
    const idx = this.tutorials.findIndex(tut => tut.id === tutorial.id);

    if (idx !== -1) {
      return undefined;
    }

    tutorial.tutor = { ...this } as any;
    this.tutorials.push(tutorial);

    return this.save();
  }

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
