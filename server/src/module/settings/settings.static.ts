import { ConsoleLogger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import { StartUpException } from '../../exceptions/StartUpException';
import { ApplicationConfiguration } from './model/ApplicationConfiguration';
import {
    DatabaseConfiguration,
    DatabaseConfigurationValidationGroup,
} from './model/DatabaseConfiguration';
import { ENV_VARIABLE_NAMES, EnvironmentConfig } from './model/EnvironmentConfig';
import { PuppeteerConfiguration } from './model/PuppeteerConfiguration';

export class StaticSettings {
    private static service: StaticSettings = new StaticSettings();

    private static readonly API_PREFIX = 'api';
    private static readonly STATIC_FOLDER = 'app';

    protected readonly config: ApplicationConfiguration;
    private readonly databaseConfig: DatabaseConfiguration;
    private readonly envConfig: EnvironmentConfig;

    protected readonly logger = new ConsoleLogger(StaticSettings.name);

    constructor() {
        this.config = this.loadConfigFile();

        this.envConfig = StaticSettings.loadEnvironmentVariables();
        this.databaseConfig = this.loadDatabaseConfig();
    }

    /**
     * Returns the currently active service.
     *
     * If no service was previously created a new one is created and returned.
     *
     * @returns Current SettingsService.
     */
    static getService(): StaticSettings {
        return StaticSettings.service;
    }

    /**
     * Returns the encryption secret for the database.
     *
     * @returns Encryption secret.
     */
    getDatabaseSecret(): string {
        return this.databaseConfig.secret;
    }

    /**
     * @returns Configuration for the database.
     */
    getDatabaseConfiguration(): DatabaseConfiguration {
        return this.databaseConfig;
    }

    /**
     *  @returns Configuration for the puppeteer instance. Can be `undefined`.
     */
    getPuppeteerConfiguration(): PuppeteerConfiguration | undefined {
        return this.config.puppeteer;
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
     * Returns the prefix for the app if there is one.
     *
     * If there is one any trailing '/' will be removed before returning the prefix.
     *
     * @returns Prefix for the app or `null` if none is provided.
     */
    getPathPrefix(): string | null {
        const { prefix } = this.config;

        if (!prefix) {
            return null;
        }

        const prefixStart = prefix.startsWith('/') ? 1 : 0;
        const prefixLength = prefix.endsWith('/') ? prefix.length - 1 : prefix.length;

        return prefix.substr(prefixStart, prefixLength);
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
            return `${pathPrefix}/${StaticSettings.API_PREFIX}`.replace('//', '/');
        } else {
            return StaticSettings.API_PREFIX;
        }
    }

    /**
     * @returns If configured it returns the URL to the handbook, otherwise `undefined` is returned.
     */
    getHandbookUrl(): string | undefined {
        return this.config.handbookUrl;
    }

    /**
     * @returns Path to the static folder.
     */
    getStaticFolder(): string {
        return StaticSettings.STATIC_FOLDER;
    }

    /**
     * Loads the configuration of the database.
     *
     * This is achieved by combining the required options from the config-file and the required environment variables.
     *
     * @returns Configuration options for the database.
     */
    private loadDatabaseConfig(): DatabaseConfiguration {
        const configFromFile: DatabaseConfiguration = this.config.database;
        const config: DatabaseConfiguration = plainToClass(DatabaseConfiguration, {
            databaseURL: configFromFile.databaseURL,
            maxRetries: configFromFile.maxRetries,
            secret: this.envConfig.secret,
            config: {
                ...configFromFile.config,
                user: this.envConfig.mongoDbUser,
                pass: this.envConfig.mongoDbPassword,
            },
        });

        this.assertConfigNoErrors(
            validateSync(config, {
                groups: [DatabaseConfigurationValidationGroup.ALL],
            })
        );

        return config;
    }

    /**
     * Loads the environment variables as `EnvironmentConfig`. If not all required variables were provided a `StartUpException` is thrown.
     *
     * @returns Valid configuration extracted from the environment variables.
     * @throws `StartUpException` - If not all required environment variables were provided.
     */
    private static loadEnvironmentVariables(): EnvironmentConfig {
        const envConfig = plainToClass(EnvironmentConfig, process.env, {
            excludeExtraneousValues: true,
        });

        StaticSettings.assertEnvNoErrors(validateSync(envConfig));

        return envConfig;
    }

    /**
     * Checks if the `errors` array is empty. If it is not a StartUpExpcetion with a proper message is thrown.
     *
     * @param errors Array containing validation errors from class-validator (or empty).
     * @throws `StartUpException` - If `errors` is not empty.
     */
    private static assertEnvNoErrors(errors: ValidationError[]) {
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
        const actualChildren = children ?? [];
        let tabs: string = '';

        for (let i = 0; i < depth; i++) {
            tabs += '\t';
        }

        let message = `The following validation error(s) occured for the "${property}" property:`;

        if (actualChildren.length > 0) {
            for (const childError of actualChildren) {
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

            this.assertConfigNoErrors(
                validateSync(config, {
                    groups: [DatabaseConfigurationValidationGroup.FILE],
                })
            );

            this.logger.log(`Configuration loaded for "${environment}" environment`);
            return config;
        } catch (err) {
            if (err instanceof StartUpException) {
                throw err;
            } else {
                throw new StartUpException(
                    `The loaded configuration for the ${environment} environment is not a valid YAML file: ${err}`
                );
            }
        }
    }
}
