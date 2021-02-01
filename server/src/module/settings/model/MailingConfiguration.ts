import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsObject, IsString, ValidateNested } from 'class-validator';
import { IsValidMailSender } from '../../../helpers/validators/nodemailer.validator';
import { IMailingAuthConfiguration, IMailingSettings } from '../../../shared/model/Settings';

export class MailingAuthConfiguration implements IMailingAuthConfiguration {
    @IsString()
    @IsNotEmpty()
    readonly user!: string;

    @IsString()
    readonly pass!: string;
}

export class MailingConfiguration implements IMailingSettings {
    @IsString()
    @IsNotEmpty()
    readonly host!: string;

    @IsNumber()
    readonly port!: number;

    @IsString()
    @IsValidMailSender()
    readonly from!: string;

    @IsString()
    @IsNotEmpty()
    readonly subject!: string;

    @IsObject()
    @ValidateNested()
    @Type(() => MailingAuthConfiguration)
    readonly auth!: MailingAuthConfiguration;
}
