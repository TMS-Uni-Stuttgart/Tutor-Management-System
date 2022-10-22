import { TestSuite } from '../../../test/helpers/TestSuite';
import { ShortTestService } from './short-test.service';
import { ShortTestModule } from './short-test.module';

describe('ShortTestService', () => {
    new TestSuite(ShortTestService, ShortTestModule);
});
