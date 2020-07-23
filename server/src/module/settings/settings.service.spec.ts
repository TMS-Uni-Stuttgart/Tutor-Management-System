import { Test, TestingModule } from '@nestjs/testing';
import { TestModule } from '../../../test/helpers/test.module';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let testModule: TestingModule;
  let service: SettingsService;

  beforeAll(async () => {
    testModule = await Test.createTestingModule({
      imports: [TestModule.forRootAsync()],
      providers: [SettingsService],
    }).compile();
  });

  afterAll(async () => {
    await testModule.close();
  });

  beforeEach(async () => {
    await testModule.get<TestModule>(TestModule).reset();

    service = testModule.get<SettingsService>(SettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
