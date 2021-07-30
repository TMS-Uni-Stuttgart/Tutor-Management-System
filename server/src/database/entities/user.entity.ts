import {
    BeforeCreate,
    BeforeUpdate,
    Collection,
    Entity,
    Enum,
    EventArgs,
    ManyToMany,
    OneToMany,
    PrimaryKey,
    Property,
} from '@mikro-orm/core';
import bcrypt from 'bcryptjs';
import { DateTime } from 'luxon';
import { Role } from 'shared/model/Role';
import { UserInEntity } from 'shared/model/Tutorial';
import { ILoggedInUserSubstituteTutorial, IUser } from 'shared/model/User';
import { v4 } from 'uuid';
import { EncryptionEngine } from '../../helpers/EncryptionEngine';
import { EncryptedEnumArrayType } from '../types/encryption/EncryptedEnumArrayType';
import { EncryptedStringType } from '../types/encryption/EncryptedStringType';
import { Substitute } from './substitute.entity';
import { Tutorial } from './tutorial.entity';

@Entity()
export class User {
    @PrimaryKey()
    id = v4();

    @Property({ type: EncryptedStringType })
    firstname: string;

    @Property({ type: EncryptedStringType })
    lastname: string;

    @Enum({ type: EncryptedEnumArrayType })
    roles: Role[];

    @Property({ type: EncryptedStringType })
    username: string;

    @Property({ type: EncryptedStringType })
    password: string;

    @Property({ type: EncryptedStringType })
    email: string;

    @Property({ type: EncryptedStringType })
    temporaryPassword?: string;

    @OneToMany(() => Tutorial, (tutorial) => tutorial.tutor, { eager: true })
    tutorials = new Collection<Tutorial>(this);

    @ManyToMany(() => Tutorial, 'correctors', { owner: true, eager: true })
    tutorialsToCorrect = new Collection<Tutorial>(this);

    @OneToMany(() => Substitute, (substitute) => substitute.substituteTutor, { eager: true })
    tutorialsToSubstitute = new Collection<Substitute>(this);

    constructor({
        firstname,
        lastname,
        roles,
        username,
        password,
        email,
        temporaryPassword,
    }: UserParams) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.roles = roles;
        this.username = username;
        this.password = password;
        this.email = email;
        this.temporaryPassword = temporaryPassword;
    }

    toDTO(): IUser {
        const tutorials = this.tutorials.getItems().map((tutorial) => tutorial.toInEntity());
        const tutorialsToCorrect = this.tutorialsToCorrect
            .getItems()
            .map((tutorial) => tutorial.toInEntity());

        return {
            id: this.id,
            username: this.username,
            firstname: this.firstname,
            lastname: this.lastname,
            roles: [...this.roles],
            email: this.email,
            temporaryPassword: this.temporaryPassword,
            tutorials,
            tutorialsToCorrect,
        };
    }

    toInEntity(): UserInEntity {
        return {
            id: this.id,
            firstname: this.firstname,
            lastname: this.lastname,
        };
    }

    getSubstituteInformation(): ILoggedInUserSubstituteTutorial[] {
        const groupedSubstituteInformation = this.getSubstitutesGroupedByTutorial();

        const substituteTutorials: ILoggedInUserSubstituteTutorial[] = [];
        for (const infos of groupedSubstituteInformation.values()) {
            const dates: DateTime[] = infos.map((info) => info.date);
            const tutorial: Tutorial = infos[0].tutorialToSubstitute;

            substituteTutorials.push({
                ...tutorial.toInEntity(),
                dates: dates.map((date) => date.toISODate()),
            });
        }
        return substituteTutorials;
    }

    private getSubstitutesGroupedByTutorial(): Map<string, Substitute[]> {
        const groupedSubstituteInformation: Map<string, Substitute[]> = new Map();
        this.tutorialsToSubstitute.getItems().forEach((substitute) => {
            const tutorialId = substitute.tutorialToSubstitute.id;
            const information: Substitute[] = groupedSubstituteInformation.get(tutorialId) ?? [];
            information.push(substitute);
            groupedSubstituteInformation.set(tutorialId, information);
        });
        return groupedSubstituteInformation;
    }

    /**
     * Makes sure that the password is saved in a hashed form.
     *
     * If the password got changed since the last load of this entity it will get rehashed. Else the password field is not changed.
     *
     * Runs on create & update events. You should not call it directly.
     *
     * @param args {@link EventArgs} Arguments of the event triggering this function.
     */
    @BeforeCreate()
    @BeforeUpdate()
    private hashPassword(args: EventArgs<User>): void {
        const prevPassword = args.changeSet?.originalEntity?.password;
        const engine = new EncryptionEngine();
        const isSamePassword = !!prevPassword && this.password === engine.decrypt(prevPassword);
        if (!isSamePassword) {
            const salt = bcrypt.genSaltSync(10);
            this.password = bcrypt.hashSync(this.password, salt);
        }
    }
}

interface UserParams {
    firstname: string;
    lastname: string;
    roles: Role[];
    username: string;
    password: string;
    email: string;
    temporaryPassword?: string;
}
