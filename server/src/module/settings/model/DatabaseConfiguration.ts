import { IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { ConnectionOptions } from 'mongoose';

export enum DatabaseConfigurationValidationGroup {
    ALL = 'all',
    FILE = 'file',
}

export class DatabaseConfiguration {
    @IsString({ always: true })
    readonly databaseURL!: string;

    @IsOptional({ always: true })
    @IsNumber({}, { always: true })
    @Min(0, { always: true })
    readonly maxRetries?: number;

    @IsOptional({ always: true })
    @IsNumber({}, { always: true })
    @Min(0, { always: true })
    readonly reconnectTimeout?: number;

    @IsString({ groups: [DatabaseConfigurationValidationGroup.ALL] })
    readonly secret!: string;

    @IsOptional({ always: true })
    @IsObject({ always: true })
    readonly config?: Omit<ConnectionOptions, 'auth'>;
}
