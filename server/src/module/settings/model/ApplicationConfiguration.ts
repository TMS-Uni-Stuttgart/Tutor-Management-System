import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUrl, Min, ValidateNested } from 'class-validator';
import { ClientSettingsDTO } from '../settings.dto';
import { DatabaseConfiguration } from './DatabaseConfiguration';

export class ApplicationConfiguration {
    @IsOptional()
    @IsNumber()
    @Min(0)
    readonly sessionTimeout?: number;

    @IsOptional()
    @IsString()
    readonly prefix?: string;

    @IsOptional()
    @IsUrl()
    readonly handbookUrl?: string;

    @Type(() => DatabaseConfiguration)
    @ValidateNested()
    readonly database!: DatabaseConfiguration;

    @IsOptional()
    @Type(() => ClientSettingsDTO)
    @ValidateNested()
    readonly defaultSettings: ClientSettingsDTO | undefined;
}
