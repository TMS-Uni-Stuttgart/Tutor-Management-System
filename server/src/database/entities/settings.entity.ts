import { Embeddable, Embedded, Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Embeddable()
export class MailAuthSetting {
    @Property()
    user: string;

    @Property()
    password: string;

    constructor(params: MailAuthParams) {
        this.user = params.user;
        this.password = params.password;
    }
}

@Embeddable()
export class MailSetting {
    @Property()
    host: string;

    @Property()
    port: number;

    @Property()
    from: string;

    @Property()
    subject: string;

    @Embedded()
    auth: MailAuthSetting;

    constructor(params: MailSettingsParams) {
        this.host = params.host;
        this.port = params.port;
        this.from = params.from;
        this.subject = params.subject;
        this.auth = new MailAuthSetting(params.authOptions);
    }
}

@Entity()
export class Setting {
    /**
     * The PK is set to be a specific string to ensure there always is at most one `Setting` object saved in the database.
     */
    @PrimaryKey({ type: 'varchar(8)' })
    readonly id = 'SETTINGS';

    @Property()
    defaultTeamSize: number;

    @Property()
    canTutorExcuseStudents: boolean;

    @Property()
    gradingFilename: string;

    @Property()
    tutorialGradingFilename: string;

    @Embedded()
    mailSettings?: MailSetting;

    constructor(params: SettingParams) {
        this.defaultTeamSize = params.defaultTeamSize;
        this.canTutorExcuseStudents = params.canTutorExcuseStudents;
        this.gradingFilename = params.gradingFilename;
        this.tutorialGradingFilename = params.tutorialGradingFilename;

        if (!!params.mailSettings) {
            this.mailSettings = new MailSetting(params.mailSettings);
        }
    }
}

interface MailAuthParams {
    user: string;
    password: string;
}

interface MailSettingsParams {
    host: string;
    port: number;
    from: string;
    subject: string;
    authOptions: MailAuthParams;
}

interface SettingParams {
    defaultTeamSize: number;
    canTutorExcuseStudents: boolean;
    gradingFilename: string;
    tutorialGradingFilename: string;
    mailSettings?: MailSettingsParams;
}
