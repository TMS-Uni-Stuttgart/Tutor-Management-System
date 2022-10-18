import { EntityRepository, MikroORM, UseRequestContext } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { IClientSettings, IMailingSettings } from 'shared/model/Settings';
import { Setting } from '../../database/entities/settings.entity';
import { StartUpException } from '../../exceptions/StartUpException';
import { ClientSettingsDTO } from './settings.dto';
import { StaticSettings } from './settings.static';

@Injectable()
export class SettingsService extends StaticSettings implements OnApplicationBootstrap {

    constructor(
        private readonly orm: MikroORM,
        @InjectRepository(Setting)
        private readonly repository: EntityRepository<Setting> 
    ) { 
        super()
    }

    /**
     * @returns The current settings saved in the DB.
     *
     * @see getSettingsEntity
     */
    async getClientSettings(): Promise<IClientSettings> {
        const settings = await this.getSettingsEntity();
        return settings.toDTO();
    }

    /**
     * Changes the settings saved in the DB to use the new settings.
     *
     * If `settings` does not contain a property this setting-property will be untouched (ie the previous value will be used).
     *
     * @param dto New settings to use.
     */
    async setClientSettings(dto: ClientSettingsDTO): Promise<void> {
        const settings = await this.getSettingsEntity();

        settings.updateFromDTO(dto);

        await this.repository.persistAndFlush(settings);
    }

    /**
     * @returns MailingConfiguration saved in the DB or `undefined` if none are saved.
     */
    async getMailingOptions(): Promise<IMailingSettings | undefined> {
        const settings = await this.getSettingsEntity();
        return settings.mailSettings?.toDTO();
    }

    /**
     * Checks if there is a `SettingsDocument` in the database.
     *
     * If there is NO settings document after module initialization a new default `SettingsDocument` is created.
     *
     * If there is ONE nothing is done.
     */
    @UseRequestContext()
    async onApplicationBootstrap(): Promise<void> {
        const settings = await this.repository.findOne({
            id: Setting.SETTING_ID,
        });

        if (!settings) {
            this.logger.log(
                'No settings were provided. Creating new default settings...',
                SettingsService.name
            );

            try {
                const defaults = this.generateDefaultSettings();
                this.logger.log(
                    `Default settings used: ${JSON.stringify(defaults)}`,
                    SettingsService.name
                );

                await this.repository.persistAndFlush(defaults);
                this.logger.log('Default settings successfully created.', SettingsService.name);
            } catch (err) {
                throw new StartUpException('Could not create the default settings.');
            }
        }
    }

    /**
     * Find the settings document in the database.
     *
     * Finds and returns the `SettingsDocument` saved in the database. If there is more than one the first document is returned.
     *
     * @returns `SettingsDocument` if there is one, `undefined` else.
     * @throws `Error` - If there is not `SettingsDocument` saved in the database.
     */
    private async getSettingsEntity(): Promise<Setting> {
        const settings = await this.repository.findOne({
            id: Setting.SETTING_ID,
        });

        if (!settings) {
            throw new Error(
                'No settings document saved in the database. This might be due to a failed initialization.'
            );
        }

        return settings;
    }

    /**
     * Generates a `SettingsModel` with some default values.
     *
     * The defaults can be overwritten by the config file. If they are present in said file those values will be used.
     */
    private generateDefaultSettings(): Setting {
        const defaultsFromConfig = this.config.defaultSettings;
        return Setting.fromDTO(defaultsFromConfig);
    }
}
