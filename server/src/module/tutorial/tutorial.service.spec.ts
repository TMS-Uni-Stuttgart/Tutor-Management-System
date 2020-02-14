import { Test, TestingModule } from '@nestjs/testing';
import { TutorialService } from './tutorial.service';

describe('TutorialService', () => {
  let service: TutorialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TutorialService],
    }).compile();

    service = module.get<TutorialService>(TutorialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
