import { DocumentType, modelOptions, plugin, pre, prop } from '@typegoose/typegoose';
import bcrypt from 'bcryptjs';
import mongooseAutopopulate from 'mongoose-autopopulate';
import { EncryptedDocument, fieldEncryption } from 'mongoose-field-encryption';
import { Role } from 'src/shared/model/Role';
import { CollectionName } from '../../helpers/CollectionName';
import { CRUDModel } from '../../helpers/CRUDService';
import { NoFunctions } from '../../helpers/NoFunctions';
import { StaticSettings } from '../../module/settings/settings.static';
import { CreateUserDTO, UserDTO } from '../../module/user/user.dto';
import { IUser } from '../../shared/model/User';
import VirtualPopulation, { VirtualPopulationOptions } from '../plugins/VirtualPopulation';
import { TutorialDocument } from './tutorial.model';

/**
 * Populates the fields in the given UserDocument. If no document is provided this functions does nothing.
 *
 * @param doc UserDocument to populate.
 */
export async function populateUserDocument(doc?: UserDocument): Promise<void> {
  if (!doc || !doc.populate) {
    return;
  }

  await doc.populate('tutorials').populate('tutorialsToCorrect').execPopulate();
}

type AssignableFields = Omit<NoFunctions<UserModel>, 'tutorials' | 'tutorialsToCorrect'>;

@plugin(fieldEncryption, {
  secret: StaticSettings.getService().getDatabaseSecret(),
  fields: ['firstname', 'lastname', 'temporaryPassword', 'password', 'email', 'roles'],
})
@plugin(mongooseAutopopulate)
@pre<UserModel>('save', async function (next) {
  const isHashed = /^\$2[ayb]\$.{56}$/.test(this.password);

  if (isHashed) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);

  this.password = hashedPassword;
  next();
})
@plugin<typeof VirtualPopulation, VirtualPopulationOptions<UserModel>>(VirtualPopulation, {
  populateDocument: populateUserDocument as any,
})
@modelOptions({ schemaOptions: { collection: CollectionName.USER, toObject: { virtuals: true } } })
export class UserModel extends CRUDModel<UserDTO, IUser, CreateUserDTO> {
  @prop({ required: true })
  firstname!: string;

  @prop({ required: true })
  lastname!: string;

  @prop({ required: true, type: String })
  roles!: Role[];

  @prop({ required: true })
  username!: string;

  @prop({ required: true })
  password!: string;

  @prop({ default: '' })
  email!: string;

  @prop()
  temporaryPassword?: string;

  @prop({
    ref: 'TutorialModel',
    foreignField: 'tutor',
    localField: '_id',
  })
  tutorials!: TutorialDocument[];

  @prop({
    ref: 'TutorialModel',
    foreignField: 'correctors',
    localField: '_id',
  })
  tutorialsToCorrect!: TutorialDocument[];

  fromDTO(dto: CreateUserDTO): UserModel {
    const model = new UserModel();

    model.assignDTO(model, dto);
    model.temporaryPassword = dto.password;
    model.password = dto.password;
    model.tutorials = [];
    model.tutorialsToCorrect = [];

    return model;
  }

  updateFromDTO(this: UserDocument, dto: UserDTO): void {
    const {} = dto;
  }

  toDTO(this: UserDocument): IUser {
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
      roles: [...roles],
      email,
      temporaryPassword,
      tutorials: tutorials.map((tutorial) => ({
        id: tutorial.id,
        slot: tutorial.slot,
      })),
      tutorialsToCorrect: tutorialsToCorrect.map((tutorial) => ({
        id: tutorial.id,
        slot: tutorial.slot,
      })),
    };
  }

  private assignDTO(model: UserModel, dto: UserDTO): void {
    const { email, firstname, lastname, roles, tutorials, tutorialsToCorrect, username } = dto;
    model.firstname = firstname;
    model.lastname = lastname;
    model.email = email;
    model.roles = roles;
    model.username = username;
  }
}

export type UserDocument = EncryptedDocument<DocumentType<UserModel>>;
