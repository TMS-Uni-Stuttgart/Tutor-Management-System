import { TestSuite } from '../../../test/helpers/TestSuite';
import { SettingsService } from '../settings/settings.service';
import { TemplateService } from './template.service';

describe('TemplateService', () => {
    new TestSuite(TemplateService, [SettingsService, TemplateService]);
});
