import { Injectable, Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';
import fs from 'fs';
import { ConnectionOptions } from 'mongoose';
import path from 'path';
import YAML from 'yaml';
import { StartUpException } from '../../exceptions/StartUpException';
import { ApplicationConfiguration } from './model/ApplicationConfiguration';
import { DatabaseConfiguration } from './model/DatabaseConfiguration';
import { EnvironmentConfig, ENV_VARIABLE_NAMES } from './model/EnvironmentConfig';
import { MailingConfiguration } from './model/MailingConfiguration';

export interface DatabaseConfig {
  databaseURL: string;
  secret: string;
  config: ConnectionOptions;
  maxRetries?: number;
}

@Injectable()
export class SettingsService {
  private static service: SettingsService | undefined;

  private readonly API_PREFIX = 'api';
  private readonly logger = new Logger(SettingsService.name);

  private readonly config: ApplicationConfiguration;
  private readonly databaseConfig: Readonly<DatabaseConfig>;
  private readonly envConfig: EnvironmentConfig;

  constructor() {
    this.config = this.loadConfigFile();

    this.envConfig = this.loadEnvironmentVariables();
    this.databaseConfig = this.loadDatabaseConfig();

    SettingsService.service = this;
  }

  /**
   * Returns the currently active service.
   *
   * If no service was previously created a new one is created and returned.
   *
   * @returns Current SettingsService.
   */
  static getService() {
    if (!SettingsService.service) {
      return new SettingsService();
    }

    return SettingsService.service;
  }

  /**
   * Returns the encryption secret.
   *
   * If no SettingsService was previously created a new one is created.
   *
   * @returns Encrytion secret.
   */
  static getSecret(): string {
    const service = this.getService();

    return service.getDatabaseConfiguration().secret;
  }

  /**
   * @returns Configuration for the database.
   */
  getDatabaseConfiguration(): DatabaseConfig {
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
    if (this.config.sessionTimeout !== undefined) {
      return this.config.sessionTimeout;
    } else {
      this.logger.warn(
        "No 'sessionTimeout' setting was provided. Falling back to a default value of 120 minutes."
      );

      return 120;
    }
  }

  /**
   * @returns Prefix for the app or `null` if none is provided.
   */
  getPathPrefix(): string | null {
    return this.config.prefix ?? null;
  }

  /**
   * @returns Path to the configuration folder.
   */
  getConfigPath(): string {
    return path.join(process.cwd(), 'config');
  }

  /**
   * @returns Prefix for the API path.
   */
  getAPIPrefix(): string {
    const pathPrefix = this.getPathPrefix();

    if (pathPrefix) {
      return `${pathPrefix}/${this.API_PREFIX}`.replace('//', '/');
    } else {
      return this.API_PREFIX;
    }
  }

  /**
   * @returns Configuration for the mailing service.
   */
  getMailingConfiguration(): MailingConfiguration {
    return this.config.mailing;
  }

  /**
   * Loads the configuration of the database.
   *
   * This is achieved by combining the required options from the config-file and the required environment variables.
   *
   * @returns Configuration options for the database.
   */
  private loadDatabaseConfig(): DatabaseConfig {
    const configFromFile: DatabaseConfiguration = this.config.database;

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

    this.assertEnvNoErrors(validateSync(envConfig));

    return envConfig;
  }

  /**
   * Checks if the `errors` array is empty. If it is not a StartUpExpcetion with a proper message is thrown.
   *
   * @param errors Array containing validation errors from class-validator (or empty).
   * @throws `StartUpException` - If `errors` is not empty.
   */
  private assertEnvNoErrors(errors: ValidationError[]) {
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

  /**
   * Checks if the `errors` array is empty.
   *
   * If it is not empty an exception is thrown.
   *
   * @param errors Array containing the validation errors.
   *
   * @throws `StartUpException` - If the `errors` array is not empty.
   */
  private assertConfigNoErrors(errors: ValidationError[]) {
    if (errors.length === 0) {
      return;
    }

    let message: string = 'Validation for configuration failed. For more details see below:';

    for (const error of errors) {
      message += '\n' + this.getStringForError(error);
    }

    throw new StartUpException(message);
  }

  /**
   * Converts the given ValidationError to a formatted String.
   *
   * @param error Error to convert to a string.
   * @param depth Current recursion depth. Used for appending an appropriate "\t" infront of the message.
   *
   * @returns String for the given ValidationError.
   */
  private getStringForError(error: ValidationError, depth: number = 1): string {
    const { property, children, constraints } = error;
    let tabs: string = '';

    for (let i = 0; i < depth; i++) {
      tabs += '\t';
    }

    let message = `The following validation error(s) occured for the "${property}" property:`;

    if (children.length > 0) {
      for (const childError of children) {
        message += '\n' + tabs + this.getStringForError(childError, depth + 1);
      }
    } else {
      if (!!constraints) {
        for (const [constraint, msg] of Object.entries(constraints)) {
          message += '\n' + tabs + `\t${constraint} - ${msg}`;
        }
      } else {
        message += '\n' + tabs + '\tUnknown error';
      }
    }

    return message;
  }

  /**
   * Loads the configuration file and returns the parsed configuration.
   *
   * The configuration file for the current environment gets loaded and parsed.
   *
   * @returns Parsed and validated ApplicationConfiguration.
   * @throws `StartUpException` - If the configuration file does not exist or if the configuration is not valid.
   */
  private loadConfigFile(): ApplicationConfiguration {
    const environment = process.env.NODE_ENV || 'development';
    const filePath = path.join(this.getConfigPath(), `${environment}.yml`);

    try {
      const content = fs.readFileSync(filePath, { encoding: 'utf8' }).toString();

      return this.initConfig(content, environment);
    } catch (err) {
      if (err instanceof StartUpException) {
        throw err;
      } else {
        this.logger.error(err);

        throw new StartUpException(
          `Could not load the configuration for the "${environment}" environment. Make sure a corresponding configuration file exists and is readable.`
        );
      }
    }
  }

  /**
   * Loads the configuration from the given file content.
   *
   * If the content is not a valid configuration or valid YAML an exception is thrown.
   *
   * @param fileContent Content of the config file. Needs to be a valid YAML string and must contain a valid configuration.
   * @param environment Value of the NodeJS environment setting.
   *
   * @returns Parsed and validated ApplicationConfiguration.
   * @throws `StartUpException` - If either the YAML or the configuration is not valid.
   */
  private initConfig(fileContent: string, environment: string): ApplicationConfiguration {
    try {
      const configString = YAML.parse(fileContent);
      const config = plainToClass(ApplicationConfiguration, configString);

      this.assertConfigNoErrors(validateSync(config));

      this.logger.log(`Configuration loaded for "${environment}" environment`);
      return config;
    } catch (err) {
      if (err instanceof StartUpException) {
        throw err;
      } else {
        throw new StartUpException(
          `The loaded configuration for the ${environment} environment is not a valid YAML file.`
        );
      }
    }
  }
}
