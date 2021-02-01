import { Test, TestingModule } from '@nestjs/testing';
import { TestModule } from '../../../test/helpers/test.module';
import { SettingsService } from '../settings/settings.service';
import { TemplateService } from './template.service';

describe('TemplateService', () => {
    let testModule: TestingModule;
    let service: TemplateService;

    beforeAll(async () => {
        testModule = await Test.createTestingModule({
            imports: [TestModule.forRootAsync()],
            providers: [TemplateService, SettingsService],
        }).compile();
    });

    afterAll(async () => {
        await testModule.close();
    });

    beforeEach(async () => {
        await testModule.get<TestModule>(TestModule).reset();

        service = testModule.get<TemplateService>(TemplateService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
