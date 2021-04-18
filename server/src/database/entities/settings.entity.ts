import { Embeddable, Embedded, Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Embeddable()
export class MailAuthSetting {
    @Property()
    user!: string;

    @Property()
    password!: string;
}

@Embeddable()
export class MailSetting {
    @Property()
    host!: string;

    @Property()
    port!: number;

    @Property()
    from!: string;

    @Property()
    subject!: string;

    @Embedded()
    auth!: MailAuthSetting;
}

@Entity()
export class Setting {
    /**
     * The PK is set to be a specific string to ensure there always is at most one `Setting` object saved in the database.
     */
    @PrimaryKey({ type: 'varchar(8)' })
    readonly id = 'SETTINGS';

    @Property()
    defaultTeamSize!: number;

    @Property()
    canTutorExcuseStudents!: boolean;

    @Property()
    gradingFilename!: string;

    @Property()
    tutorialGradingFilename!: string;

    @Embedded()
    mailSettings?: MailSetting;
}
