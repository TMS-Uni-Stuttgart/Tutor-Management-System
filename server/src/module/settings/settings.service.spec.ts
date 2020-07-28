import { Test, TestingModule } from '@nestjs/testing';
import { sanitizeObject } from '../../../test/helpers/test.helpers';
import { TestModule } from '../../../test/helpers/test.module';
import { MockedModel } from '../../../test/helpers/testdocument';
import { SETTINGS_DOCUMENTS } from '../../../test/mocks/documents.mock';
import { SettingsModel } from '../../database/models/settings.model';
import { IClientSettings } from '../../shared/model/Settings';
import { ClientSettingsDTO } from './settings.dto';
import { SettingsService } from './settings.service';

interface AssertSettingsParams {
  expected: MockedModel<SettingsModel>;
  actual: IClientSettings;
}

function assertSettings({ expected, actual }: AssertSettingsParams) {
  const { _id, ...expectedWithoutId } = sanitizeObject(expected);
  expect(actual).toEqual(expectedWithoutId);
}

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

  it('get all settings', async () => {
    const settings = await service.getClientSettings();
    assertSettings({ actual: settings, expected: SETTINGS_DOCUMENTS[0] });
  });

  it.each<ClientSettingsDTO>([
    { defaultTeamSize: 5 },
    { canTutorExcuseStudents: true },
    { defaultTeamSize: 3, canTutorExcuseStudents: true },
  ])('change setting with DTO "%s"', async (newSetting: ClientSettingsDTO) => {
    await service.setClientSettings(newSetting);

    const settings = await service.getClientSettings();
    assertSettings({ actual: settings, expected: { ...SETTINGS_DOCUMENTS[0], ...newSetting } });
  });
});
