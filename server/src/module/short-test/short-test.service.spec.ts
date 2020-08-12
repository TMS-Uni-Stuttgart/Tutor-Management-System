import { Test, TestingModule } from '@nestjs/testing';
import { ShortTestService } from './short-test.service';

describe('ShortTestService', () => {
  let service: ShortTestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShortTestService],
    }).compile();

    service = module.get<ShortTestService>(ShortTestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
