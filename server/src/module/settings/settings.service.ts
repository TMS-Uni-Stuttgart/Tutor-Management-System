import { Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { SettingsModel } from '../../database/models/settings.model';
import { StaticSettings } from './settings.static';

@Injectable()
export class SettingsService extends StaticSettings {
  constructor(
    @InjectModel(SettingsModel)
    private readonly settingsModel: ReturnModelType<typeof SettingsModel>
  ) {
    super();

    // Overwrite the logger context from the parent class.
    this.logger.setContext(SettingsService.name);
  }
}
