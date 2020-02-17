import { Test, TestingModule } from '@nestjs/testing';
import { MockedUserService } from '../../../test/mocks/user.service.mock';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('User Controller', () => {
  let testingModule: TestingModule;
  let controller: UserController;

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      imports: [],
      controllers: [UserController],
      providers: [{ provide: UserService, useClass: MockedUserService }],
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
