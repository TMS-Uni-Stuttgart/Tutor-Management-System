import { TestSuite } from '../../../test/helpers/TestSuite';
import { TemplateService } from './template.service';
import { TemplateModule } from './template.module';

describe('TemplateService', () => {
    new TestSuite(TemplateService, TemplateModule);
});
