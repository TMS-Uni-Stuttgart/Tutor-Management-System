import { Injectable, Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';
import config from 'config';
import { ConnectionOptions } from 'mongoose';
import { StartUpException } from '../../exceptions/StartUpException';
import { EnvironmentConfig, ENV_VARIABLE_NAMES } from './model/EnvironmentConfig';

export interface DatabaseConfig {
  databaseURL: string;
  secret: string;
  config: ConnectionOptions;
  maxRetries?: number;
}

type DatabaseConfigFromFile = Pick<DatabaseConfig, 'databaseURL' | 'maxRetries'> & {
  config: Omit<DatabaseConfig['config'], 'auth'>;
};

@Injectable()
export class SettingsService {
  private static service: SettingsService | undefined;
  private readonly databaseConfig: Readonly<DatabaseConfig>;
  private readonly envConfig: EnvironmentConfig;

  constructor() {
    this.envConfig = this.loadEnvironmentVariables();
    this.databaseConfig = this.loadDatabaseConfig();

    SettingsService.service = this;
  }

  static getService() {
    if (!SettingsService.service) {
      return new SettingsService();
    }

    return SettingsService.service;
  }

  static getSecret(): string {
    // TODO: Find a better solution to get the secret before the SettingsModule gets fully loaded (due to mongoose-field-encryption needing that secret first).
    const service = this.getService();

    return service.getDatabaseConfig().secret;
  }

  /**
   * @returns Configuration for the database.
   */
  getDatabaseConfig(): DatabaseConfig {
    return this.databaseConfig;
  }

  /**
   * Returns the value of the `sessionTimeout` setting.
   *
   * If no `sessionTimeout` configuration was provided or if the provided configuration is invalid than a default value of 120 minutes is being return.
   *
   * @returns The specified session timeout in _minutes_.
   */
  getSessionTimeout(): number {
    try {
      const timeoutSetting = config.get('sessionTimeout');

      if (typeof timeoutSetting === 'number') {
        return timeoutSetting;
      }

      if (typeof timeoutSetting === 'string') {
        const timeout = Number.parseInt(timeoutSetting, 10);

        if (!Number.isNaN(timeout)) {
          return timeout;
        }
      }

      Logger.warn(
        `Invalid setting for 'sessionTimeout' provided (got: '${timeoutSetting}'). It has to be a number or a string which could be parsed to an integer. Falling back to a default value of 2h.`
      );

      return 120;
    } catch {
      Logger.warn(
        "No setting for 'sessionTimeout' got provided. Falling back to the default value of 2h."
      );

      return 120;
    }
  }

  private loadDatabaseConfig(): DatabaseConfig {
    const configFromFile: DatabaseConfigFromFile = config.get('database');

    return {
      databaseURL: configFromFile.databaseURL,
      maxRetries: configFromFile.maxRetries,
      secret: this.envConfig.secret,
      config: {
        ...configFromFile.config,
        auth: {
          user: this.envConfig.mongoDbUser,
          password: this.envConfig.mongoDbPassword,
        },
      },
    };
  }

  /**
   * Loads the environment variables as `EnvironmentConfig`. If not all required variables were provided a `StartUpException` is thrown.
   *
   * @returns Valid configuration extracted from the environment variables.
   * @throws `StartUpException` - If not all required environment variables were provided.
   */
  private loadEnvironmentVariables(): EnvironmentConfig {
    const envConfig = plainToClass(EnvironmentConfig, process.env, {
      excludeExtraneousValues: true,
    });

    this.assertNoErrors(validateSync(envConfig));

    return envConfig;
  }

  /**
   * Checks if the `errors` array is empty. If it is not a StartUpExpcetion with a proper message is thrown.
   *
   * @param errors Array containing validation errors from class-validator (or empty).
   * @throws `StartUpException` - If `errors` is not empty.
   */
  private assertNoErrors(errors: ValidationError[]) {
    if (errors.length === 0) {
      return;
    }

    let message: string = 'The following environment variables are not set:';

    for (const error of errors) {
      const nameOfEnvVariable: string = (ENV_VARIABLE_NAMES as any)[error.property];

      message += `\n- ${nameOfEnvVariable}`;
    }

    throw new StartUpException(message);
  }
}
