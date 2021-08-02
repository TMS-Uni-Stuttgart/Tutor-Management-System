import { UnauthorizedException } from '@nestjs/common';
import { Role } from 'shared/model/Role';
import { TestSuite } from '../../test/helpers/TestSuite';
import { MOCKED_USERS } from '../../test/mocks/entities.mock';
import { AuthService } from './auth.service';

describe('AuthService', () => {
    const suite = new TestSuite(AuthService, [AuthService]);

    it('fail on non-existing username', async () => {
        await expect(
            suite.service.validateUser('definitelyNotHarry', 'harrysPassword')
        ).rejects.toThrow(UnauthorizedException);
    });

    it('fail on wrong password', async () => {
        await expect(
            suite.service.validateUser('potterhy', 'definitelyNotHisPassword')
        ).rejects.toThrow(UnauthorizedException);
    });

    it('login user', async () => {
        const credentials = await suite.service.validateUser('potterhy', 'harrysPassword');

        expect(credentials).toEqual({
            id: MOCKED_USERS[1].id,
            username: 'potterhy',
            roles: [Role.TUTOR],
        });
    });
});
