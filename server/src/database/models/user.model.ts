import { DocumentType, modelOptions, plugin, pre, prop } from '@typegoose/typegoose';
import bcrypt from 'bcryptjs';
import mongooseAutopopulate from 'mongoose-autopopulate';
import { EncryptedDocument, fieldEncryption } from 'mongoose-field-encryption';
import { Role } from 'shared/model/Role';
import { CollectionName } from '../../helpers/CollectionName';
import { NoFunctions } from '../../helpers/NoFunctions';
import { StaticSettings } from '../../module/settings/settings.static';
import { IUser } from '../../shared/model/User';
import { TutorialDocument } from './tutorial.model';

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
@modelOptions({
    schemaOptions: {
        collection: CollectionName.USER,
        toObject: { virtuals: true },
    },
})
export class UserModel {
    constructor(fields: AssignableFields) {
        Object.assign(this, fields);

        this.tutorials = [];
        this.tutorialsToCorrect = [];
    }

    @prop({ required: true })
    firstname!: string;

    @prop({ required: true })
    lastname!: string;

    @prop({ required: true, type: String })
    roles!: Role[];

    @prop({ required: true, index: true })
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
        autopopulate: { maxDepth: 1 },
    })
    tutorials!: TutorialDocument[];

    @prop({
        ref: 'TutorialModel',
        foreignField: 'correctors',
        localField: '_id',
        autopopulate: { maxDepth: 1 },
    })
    tutorialsToCorrect!: TutorialDocument[];

    /**
     * @returns The DTO representation of the document.
     */
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
            tutorials: tutorials.map((tutorial) => tutorial.toInEntity()),
            tutorialsToCorrect: tutorialsToCorrect.map((tutorial) => tutorial.toInEntity()),
        };
    }
}

export type UserDocument = EncryptedDocument<DocumentType<UserModel>>;
