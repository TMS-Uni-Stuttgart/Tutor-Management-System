import { Test, TestingModule } from '@nestjs/testing';
import { TutorialController } from './tutorial.controller';
import { TutorialService } from './tutorial.service';
import { mocked } from 'ts-jest/utils';

jest.mock('./tutorial.service');
const mockedTutorialService = mocked(TutorialService, true);

describe('Tutorial Controller', () => {
  let controller: TutorialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TutorialController],
      providers: [{ provide: TutorialService, useValue: mockedTutorialService }],
    }).compile();

    controller = module.get<TutorialController>(TutorialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
