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
   * Find the settings document in the database.
   *
   * Finds and returns the `SettingsDocument` saved in the database. If there is more than one the first document is returned.
   *
   * @returns `SettingsDocument` if there is one, `undefined` else.
   * @throws `Error` - If there is not `SettingsDocument` saved in the database.
   */
  async getSettingsDocument(): Promise<SettingsDocument> {
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
        const defaultsFromConfig = this.config.defaultSettings;
        const defaultSettings = new SettingsModel({
          defaultTeamSize: defaultsFromConfig?.defaultTeamSize ?? 2,
          canTutorExcuseStudents: defaultsFromConfig?.canTutorExcuseStudents ?? false,
        });
        await this.settingsModel.create(defaultSettings);

        this.logger.log('Default settings document successfully created.');
      } catch (err) {
        throw new StartUpException('Could not create the default settings document.');
      }
    }
  }
}
