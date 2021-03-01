import { Test, TestingModule } from '@nestjs/testing';
import { sanitizeObject } from '../../../test/helpers/test.helpers';
import { TestModule } from '../../../test/helpers/test.module';
import { MockedModel } from '../../../test/helpers/testdocument';
import { SETTINGS_DOCUMENTS } from '../../../test/mocks/documents.mock';
import { IClientSettings } from '../../shared/model/Settings';
import { ClientSettingsDTO } from './settings.dto';
import { SettingsService } from './settings.service';

interface AssertSettingsParams {
    expected: MockedModel<IClientSettings>;
    actual: IClientSettings;
}

function assertSettings({ expected, actual }: AssertSettingsParams) {
    const { _id, ...expectedWithoutId } = sanitizeObject(expected);
    const sanitizedActual = sanitizeObject(actual);
    expect(sanitizedActual).toEqual(expectedWithoutId);
}

const DEFAULT_SETTINGS: ClientSettingsDTO = {
    defaultTeamSize: 2,
    canTutorExcuseStudents: false,
    gradingFilename: 'default_filename',
    tutorialGradingFilename: 'default_tutorial_grading_filename',
};

const SOME_MAILING_SETTINGS: ClientSettingsDTO['mailingConfig'] = {
    auth: { user: 'username', pass: 'password' },
    from: 'sender@from.mail',
    host: 'some-host-address',
    port: 1234,
    subject: 'subject of mail',
};

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
        { ...DEFAULT_SETTINGS, defaultTeamSize: 5 },
        { ...DEFAULT_SETTINGS, canTutorExcuseStudents: true },
        {
            ...DEFAULT_SETTINGS,
            defaultTeamSize: 3,
            canTutorExcuseStudents: true,
        },
        {
            ...DEFAULT_SETTINGS,
            gradingFilename: 'Grading_Ex#{sheetNo}_#{teamName}',
        },
        {
            ...DEFAULT_SETTINGS,
            tutorialGradingFilename: 'Tutorial_#{tutorialSlot}_Sheet#{sheetNo}',
        },
        {
            ...DEFAULT_SETTINGS,
            mailingConfig: SOME_MAILING_SETTINGS,
        },
    ])('change setting with DTO "%s"', async (newSetting: ClientSettingsDTO) => {
        await service.setClientSettings(newSetting);

        const settings = await service.getClientSettings();
        assertSettings({
            actual: settings,
            expected: { ...SETTINGS_DOCUMENTS[0], ...newSetting },
        });
    });

    it('remove mailing settings', async () => {
        const oldDto: ClientSettingsDTO = {
            ...DEFAULT_SETTINGS,
            mailingConfig: SOME_MAILING_SETTINGS,
        };
        await service.setClientSettings(oldDto);

        const oldSettings = await service.getClientSettings();
        expect(oldSettings.mailingConfig).toBeDefined();

        const newDto: ClientSettingsDTO = { ...DEFAULT_SETTINGS };
        await service.setClientSettings(newDto);

        const newSettings = await service.getClientSettings();
        expect(newSettings.mailingConfig).not.toBeDefined();
    });
});
