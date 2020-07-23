import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsString, ValidateNested } from 'class-validator';

export class MailingAuthConfiguration {
  @IsString()
  readonly user!: string;

  @IsString()
  readonly pass!: string;
}

export class MailingConfiguration {
  @IsBoolean()
  readonly testingMode!: boolean;

  @IsString()
  readonly host!: string;

  @IsNumber()
  readonly port!: number;

  @ValidateNested()
  @Type(() => MailingAuthConfiguration)
  readonly auth!: MailingAuthConfiguration;
}
