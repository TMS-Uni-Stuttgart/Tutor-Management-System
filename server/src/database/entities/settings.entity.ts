import { Embeddable, Embedded, Entity, Property } from '@mikro-orm/core';

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
