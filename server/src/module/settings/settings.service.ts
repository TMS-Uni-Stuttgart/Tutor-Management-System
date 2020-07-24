import { Injectable, OnModuleInit } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { SettingsDocument, SettingsModel } from '../../database/models/settings.model';
import { StartUpException } from '../../exceptions/StartUpException';
import { StaticSettings } from './settings.static';

@Injectable()
export class SettingsService extends StaticSettings implements OnModuleInit {
  constructor(
    @InjectModel(SettingsModel)
    private readonly settingsModel: ReturnModelType<typeof SettingsModel>
  ) {
    super();

    // Overwrite the logger context from the parent class.
    this.logger.setContext(SettingsService.name);
  }

  /**
   * @returns The current settings.
   *
   * @see getSettingsDocument
   */
  async getAllSettings(): Promise<ISettings> {
    const document = await this.getSettingsDocument();
    return document.toDTO();
  }

  /**
   * Checks if there is a `SettingsDocument` in the database.
   *
   * If there is NO settings document after module initialization a new default `SettingsDocument` is created.
   *
   * If there is ONE nothing is done.
   */
  async onModuleInit(): Promise<void> {
    const document = await this.settingsModel.find();

    if (document.length === 0) {
      this.logger.log('No settings document provided. Creating new default settings document...');

      try {
        const defaults = this.generateDefaultSettings();
        this.logger.log(`Default settings used: ${JSON.stringify(defaults)}`);
        await this.settingsModel.create(defaults);

        this.logger.log('Default settings document successfully created.');
      } catch (err) {
        throw new StartUpException('Could not create the default settings document.');
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
  private async getSettingsDocument(): Promise<SettingsDocument> {
    const documents = await this.settingsModel.find();

    if (documents.length > 1) {
      this.logger.warn(
        'More than one settings document was found. Using the first entry in the database.'
      );
    }

    if (!documents[0]) {
      throw new Error(
        'No settings document saved in the database. This might be due to a failed initialization.'
      );
    }

    return documents[0];
  }

  /**
   * Generates a `SettingsModel` with some default values.
   *
   * The defaults can be overwritten by the config file. If they are present in said file those values will be used.
   */
  private generateDefaultSettings(): SettingsModel {
    const defaultsFromConfig = this.config.defaultSettings;
    return new SettingsModel(defaultsFromConfig);
  }
}
