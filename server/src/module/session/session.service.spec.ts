import { TestSuite } from '../../../test/helpers/TestSuite';
import { SessionService } from './session.service';
import { SessionModule } from './session.module';

describe('SessionService', () => {
    new TestSuite(SessionService, SessionModule);
});
