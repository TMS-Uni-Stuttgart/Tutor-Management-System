import { Type } from 'class-transformer';
import { IsNumber, IsString, ValidateNested } from 'class-validator';
import { IMailingAuthConfiguration, IMailingSettings } from '../../../shared/model/Settings';

export class MailingAuthConfiguration implements IMailingAuthConfiguration {
  @IsString()
  readonly user!: string;

  @IsString()
  readonly pass!: string;
}

export class MailingConfiguration implements IMailingSettings {
  @IsString()
  readonly host!: string;

  @IsNumber()
  readonly port!: number;

  @IsString()
  readonly from!: string;

  @ValidateNested()
  @Type(() => MailingAuthConfiguration)
  readonly auth!: MailingAuthConfiguration;
}
