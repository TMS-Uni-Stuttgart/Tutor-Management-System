import { Test, TestingModule } from '@nestjs/testing';
import { TestModule } from '../../../test/helpers/test.module';
import { ShortTestService } from './short-test.service';

describe('ShortTestService', () => {
    let testModule: TestingModule;
    let service: ShortTestService;

    beforeAll(async () => {
        testModule = await Test.createTestingModule({
            imports: [TestModule.forRootAsync()],
            providers: [ShortTestService],
        }).compile();
    });

    afterAll(async () => {
        await testModule.close();
    });

    beforeEach(async () => {
        await testModule.get<TestModule>(TestModule).reset();

        service = testModule.get<ShortTestService>(ShortTestService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
