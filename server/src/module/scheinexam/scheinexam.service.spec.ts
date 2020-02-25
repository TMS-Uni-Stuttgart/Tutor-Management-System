import { Test, TestingModule } from '@nestjs/testing';
import { ScheinexamService } from './scheinexam.service';

describe('ScheinexamService', () => {
  let service: ScheinexamService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScheinexamService],
    }).compile();

    service = module.get<ScheinexamService>(ScheinexamService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
