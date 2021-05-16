import { Embeddable, Embedded, Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { IClientSettings, IMailingSettings } from 'shared/model/Settings';
import { ClientSettingsDTO } from '../../module/settings/settings.dto';
import { EncryptedIntType } from '../types/encryption/EncryptedNumberType';
import { EncryptedStringType } from '../types/encryption/EncryptedStringType';

export class MailAuthSetting {
    readonly user: string;

    readonly password: string;

    constructor(params: MailAuthParams) {
        this.user = params.user;
        this.password = params.password;
    }
}

@Embeddable()
export class MailSetting {
    @Property({ type: EncryptedStringType })
    readonly host: string;

    @Property({ type: EncryptedIntType })
    readonly port: number;

    @Property({ type: EncryptedStringType })
    readonly from: string;

    @Property({ type: EncryptedStringType })
    readonly subject: string;

    // TODO: Try use nested embeddables with v5.
    @Property({ type: EncryptedStringType })
    private readonly user: string;

    @Property({ type: EncryptedStringType })
    private readonly password: string;

    get auth(): MailAuthSetting {
        return new MailAuthSetting({ user: this.user, password: this.password });
    }

    constructor(params: MailSettingsParams) {
        this.host = params.host;
        this.port = params.port;
        this.from = params.from;
        this.subject = params.subject;
        this.user = params.authOptions.user;
        this.password = params.authOptions.password;
    }

    toDTO(): IMailingSettings {
        return {
            from: this.from,
            host: this.host,
            port: this.port,
            subject: this.subject,
            auth: { user: this.auth.user, pass: this.auth.password },
        };
    }
}

@Entity()
export class Setting {
    static SETTING_ID = 'SETTINGS';

    /**
     * The PK is set to be a specific string to ensure there always is at most one `Setting` object saved in the database.
     */
    @PrimaryKey()
    readonly id: string = Setting.SETTING_ID;

    @Property()
    defaultTeamSize!: number;

    @Property()
    canTutorExcuseStudents!: boolean;

    @Property()
    gradingFilename!: string;

    @Property()
    tutorialGradingFilename!: string;

    @Embedded(() => MailSetting, { nullable: true, object: true })
    mailSettings?: MailSetting;

    private constructor(dto?: ClientSettingsDTO) {
        this.updateFromDTO(dto);
    }

    toDTO(): IClientSettings {
        return {
            defaultTeamSize: this.defaultTeamSize,
            canTutorExcuseStudents: this.canTutorExcuseStudents,
            gradingFilename: this.gradingFilename,
            tutorialGradingFilename: this.tutorialGradingFilename,
            mailingConfig: this.mailSettings?.toDTO(),
        };
    }

    updateFromDTO(dto?: ClientSettingsDTO): void {
        this.defaultTeamSize = dto?.defaultTeamSize ?? 2;
        this.canTutorExcuseStudents = dto?.canTutorExcuseStudents ?? false;
        this.gradingFilename = dto?.gradingFilename ?? 'Ex#{sheetNo}_#{teamName}';
        this.tutorialGradingFilename =
            dto?.tutorialGradingFilename ?? 'Tutorial_#{tutorialSlot}_Ex#{sheetNo}';

        const mailSettingParams = this.generateMailingParamsFromDTO(dto);

        if (mailSettingParams) {
            this.mailSettings = new MailSetting(mailSettingParams);
        }
    }

    private generateMailingParamsFromDTO(dto?: ClientSettingsDTO): MailSettingsParams | undefined {
        const mailParams = dto?.mailingConfig;
        return mailParams
            ? {
                  from: mailParams.from,
                  host: mailParams.host,
                  port: mailParams.port,
                  subject: mailParams.subject,
                  authOptions: { user: mailParams.auth.user, password: mailParams.auth.pass },
              }
            : undefined;
    }

    static fromDTO(dto?: ClientSettingsDTO): Setting {
        return new Setting(dto);
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
