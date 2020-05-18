import { ValidateNested, IsString, IsBoolean, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class MailingAuthConfiguration {
  @IsString()
  readonly user!: string;

  @IsString()
  readonly pass!: string;
}

export class MailingConfiguration {
  @IsBoolean()
  readonly testingMode!: boolean;

  // TODO: Move into general HTML-Template folder!
  @IsString()
  readonly template!: string;

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
