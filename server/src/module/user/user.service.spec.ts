import { Test, TestingModule } from '@nestjs/testing';
import { Mock, MongooseModelProvider } from '../../helpers/test/test.provider';
import { Role } from '../../shared/model/Role';
import { User } from '../../shared/model/User';
import { UserModel } from '../models/user.model';
import { TutorialService } from '../tutorial/tutorial.service';
import { UserService } from './user.service';

const USER_DOCUMENTS: UserModel[] = [
  new UserModel({
    firstname: 'Harry',
    lastname: 'Potter',
    email: 'harrypotter@hogwarts.com',
    username: 'potterhy',
    password: 'harrysPassword',
    temporaryPassword: undefined,
    roles: [Role.TUTOR],
    tutorials: [],
    tutorialsToCorrect: [],
  }),
];

function mockUserModel(mock: Mock) {
  mock.toReturn(JSON.parse(JSON.stringify(USER_DOCUMENTS)), 'find');
}

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: TutorialService,
          useValue: {
            findById: (ids: string[]) => [],
          },
        },
        MongooseModelProvider.create({
          provide: 'UserModelModel',
          modelClass: UserModel,
          factory: mockUserModel,
        }),
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('find all users', async () => {
    const allUsers: User[] = await service.findAll();

    expect(JSON.parse(JSON.stringify(allUsers))).toEqual(USER_DOCUMENTS);
  });
});
