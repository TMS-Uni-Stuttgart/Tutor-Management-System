import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModelProvider } from '../helpers/test/test.provider';
import { UserModel } from './user.model';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        MongooseModelProvider.create({
          provide: 'UserModelModel',
          modelClass: UserModel,
          factory: mock => mock.toReturn([], 'find'),
        }),
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('some test', async () => {
    expect(await service.findAll()).toEqual([]);
  });
});
