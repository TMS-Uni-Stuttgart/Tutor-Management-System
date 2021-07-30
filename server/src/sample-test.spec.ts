import { TestSuite } from '../test/helpers/TestSuite';
import { UserService } from './module/user/user.service';

describe('Some sample Test', () => {
    const suite = new TestSuite(UserService);

    // it('some test', () => {
    //     const service = suite.service;
    //     expect(service).toBeDefined();
    // });
});
