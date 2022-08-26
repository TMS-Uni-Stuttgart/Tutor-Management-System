import { IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { ConnectOptions } from 'mongoose';

export enum DatabaseConfigurationValidationGroup {
    ALL = 'all',
    FILE = 'file',
}

export class DatabaseConfiguration {
    @IsString({ always: true })
    readonly databaseURL!: string;

    @IsNumber({}, { always: true })
    @Min(0, { always: true })
    readonly maxRetries!: number;

    @IsString({ groups: [DatabaseConfigurationValidationGroup.ALL] })
    readonly secret!: string;

    @IsOptional({ always: true })
    @IsObject({ always: true })
    readonly config?: ConnectOptions;
}
