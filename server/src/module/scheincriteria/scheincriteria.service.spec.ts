import { Test, TestingModule } from '@nestjs/testing';
import { ScheincriteriaService } from './scheincriteria.service';

describe('ScheincriteriaService', () => {
  let service: ScheincriteriaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScheincriteriaService],
    }).compile();

    service = module.get<ScheincriteriaService>(ScheincriteriaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
