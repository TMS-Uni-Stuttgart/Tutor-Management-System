import { IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';

export enum DatabaseConfigurationValidationGroup {
    ALL = 'all',
}

export class DatabaseConfiguration {
    @IsString({ always: true })
    readonly host!: string;

    @Min(0, { always: true })
    readonly port!: number;

    @IsString({ always: true })
    readonly databaseName!: string;

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

    @IsObject({ groups: [DatabaseConfigurationValidationGroup.ALL] })
    readonly auth!: { user: string; pass: string };
}

export interface DatabaseConnectionOptions {
    readonly host: string;
    readonly port: number;
    readonly dbName: string;
    readonly user: string;
    readonly password: string;
}
