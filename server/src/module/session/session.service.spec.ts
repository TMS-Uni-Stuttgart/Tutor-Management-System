import { TestSuite } from '../../../test/helpers/TestSuite';
import { SessionService } from './session.service';

describe('SessionService', () => {
    new TestSuite(SessionService, [SessionService]);
});
