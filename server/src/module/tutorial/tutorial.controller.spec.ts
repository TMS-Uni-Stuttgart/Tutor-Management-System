import { Test, TestingModule } from '@nestjs/testing';
import { TutorialController } from './tutorial.controller';
import { TutorialService } from './tutorial.service';
import { MockedTutorialService } from '../../../test/mocks/tutorial.service.mock';

describe('Tutorial Controller', () => {
  let controller: TutorialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TutorialController],
      providers: [{ provide: TutorialService, useClass: MockedTutorialService }],
    }).compile();

    controller = module.get<TutorialController>(TutorialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
