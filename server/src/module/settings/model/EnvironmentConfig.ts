import { IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export const ENV_VARIABLE_NAMES = {
    mongoDbUser: 'TMS_MONGODB_USER',
    mongoDbPassword: 'TMS_MONGODB_PW',
    secret: 'TMS_SECRET',
};

export class EnvironmentConfig {
    @IsString()
    @Expose({ name: ENV_VARIABLE_NAMES.mongoDbUser })
    readonly mongoDbUser!: string;

    @IsString()
    @Expose({ name: ENV_VARIABLE_NAMES.mongoDbPassword })
    readonly mongoDbPassword!: string;

    @IsString()
    @Expose({ name: ENV_VARIABLE_NAMES.secret })
    readonly secret!: string;
}
