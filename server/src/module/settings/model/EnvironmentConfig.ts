import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export const ENV_VARIABLE_NAMES = {
    dbUser: 'TMS_SQL_DB_USER',
    dbPassword: 'TMS_SQL_DB_PW',
    secret: 'TMS_SECRET',
};

export class EnvironmentConfig {
    @IsString()
    @Expose({ name: ENV_VARIABLE_NAMES.dbUser })
    readonly dbUser!: string;

    @IsString()
    @Expose({ name: ENV_VARIABLE_NAMES.dbPassword })
    readonly dbPassword!: string;

    @IsString()
    @Expose({ name: ENV_VARIABLE_NAMES.secret })
    readonly secret!: string;
}
