import { Test, TestingModule } from '@nestjs/testing';
import { mocked } from 'ts-jest/utils';
import { UserController } from './user.controller';
import { UserService } from './user.service';

jest.mock('./user.service');
const mockedUserService = mocked(UserService, true);

describe('User Controller', () => {
  let testingModule: TestingModule;
  let controller: UserController;

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      imports: [],
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockedUserService }],
    }).compile();

    controller = testingModule.get<UserController>(UserController);
  });

  afterAll(async () => {
    if (testingModule) {
      await testingModule.close();
    }
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
