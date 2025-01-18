import { IClientSettings } from 'shared/model/Settings';
import { TestSuite } from '../../../test/helpers/TestSuite';
import { MOCKED_SETTINGS_DOCUMENT } from '../../../test/mocks/entities.mock';
import { Setting } from '../../database/entities/settings.entity';
import { ClientSettingsDTO } from './settings.dto';
import { SettingsModule } from './settings.module';
import { SettingsService } from './settings.service';

interface AssertSettingsParams {
    expected: Setting;
    actual: IClientSettings;
}

function assertSettings({ expected, actual }: AssertSettingsParams) {
    const { id, mailSettings: expectedMail, ...restExpected } = expected;
    const { mailingConfig: actualMail, ...restActual } = actual;

    expect(restActual).toEqual(restExpected);

    if (!!expectedMail && !!actualMail) {
        const expectedAuth = expectedMail.auth;
        const actualAuth = actualMail.auth;

        expect(actualMail.from).toEqual(expectedMail.from);
        expect(actualMail.host).toEqual(expectedMail.host);
        expect(actualMail.port).toEqual(expectedMail.port);
        expect(actualMail.subject).toEqual(expectedMail.subject);

        expect(actualAuth.user).toEqual(expectedAuth.user);
        expect(actualAuth.pass).toEqual(expectedAuth.password);
    } else {
        // Check if both are undefined.
        expect(actualMail).toEqual(expectedMail);
    }
}

const DEFAULT_SETTINGS: ClientSettingsDTO = {
    defaultTeamSize: 2,
    canTutorExcuseStudents: false,
    excludeStudentsByStatus: false,
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
    const suite = new TestSuite(SettingsService, SettingsModule);

    it('get all settings', async () => {
        const settings = await suite.service.getClientSettings();
        assertSettings({
            actual: settings,
            expected: MOCKED_SETTINGS_DOCUMENT[0],
        });
    });

    it.each<ClientSettingsDTO>([
        { ...DEFAULT_SETTINGS, defaultTeamSize: 5 },
        { ...DEFAULT_SETTINGS, canTutorExcuseStudents: true },
        { ...DEFAULT_SETTINGS, excludeStudentsByStatus: true },
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
        await suite.service.setClientSettings(newSetting);
        const settings = await suite.service.getClientSettings();

        const expected = Setting.fromDTO({
            ...DEFAULT_SETTINGS,
            ...newSetting,
        });

        assertSettings({
            actual: settings,
            expected,
        });
    });

    it('remove mailing settings', async () => {
        const oldDto: ClientSettingsDTO = {
            ...DEFAULT_SETTINGS,
            mailingConfig: SOME_MAILING_SETTINGS,
        };
        await suite.service.setClientSettings(oldDto);

        const oldSettings = await suite.service.getClientSettings();
        expect(oldSettings.mailingConfig).toBeDefined();

        const newDto: ClientSettingsDTO = { ...DEFAULT_SETTINGS };
        await suite.service.setClientSettings(newDto);

        const newSettings = await suite.service.getClientSettings();
        expect(newSettings.mailingConfig).not.toBeDefined();
    });
});
