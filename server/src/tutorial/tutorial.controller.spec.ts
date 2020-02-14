import { Test, TestingModule } from '@nestjs/testing';
import { TutorialController } from './tutorial.controller';

describe('Tutorial Controller', () => {
  let controller: TutorialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TutorialController],
    }).compile();

    controller = module.get<TutorialController>(TutorialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
