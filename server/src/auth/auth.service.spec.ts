import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import bcrypt from 'bcryptjs';
import { createUserMockModel, MockedUserModel } from '../../test/helpers/test.create-mock-model';
import { MongooseMockModelProvider } from '../../test/helpers/test.provider';
import { UserModel } from '../database/models/user.model';
import { TutorialService } from '../module/tutorial/tutorial.service';
import { UserService } from '../module/user/user.service';
import { Role } from '../shared/model/Role';
import { AuthService } from './auth.service';

const USER_DOCUMENTS: MockedUserModel[] = [
  createUserMockModel(
    new UserModel({
      firstname: 'Harry',
      lastname: 'Potter',
      email: 'harrypotter@hogwarts.com',
      username: 'potterhy',
      password: bcrypt.hashSync('harrysPassword', bcrypt.genSaltSync(10)),
      temporaryPassword: undefined,
      roles: [Role.TUTOR],
      tutorials: [],
      tutorialsToCorrect: [],
    })
  ),
];

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserService,
        { provide: TutorialService, useValue: {} },
        MongooseMockModelProvider.create({ modelClass: UserModel, documents: USER_DOCUMENTS }),
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('fail on non-existing username', async () => {
    await expect(service.validateUser('definitlyNotHarry', 'password')).rejects.toThrow(
      UnauthorizedException
    );
  });

  it('fail on wrong password', async () => {
    await expect(service.validateUser('potterhy', 'definitlyNotHisPassword')).rejects.toThrow(
      UnauthorizedException
    );
  });

  it('login user', async () => {
    const credentials = await service.validateUser('potterhy', 'harrysPassword');

    expect(credentials).toEqual({
      _id: USER_DOCUMENTS[0]._id,
      username: 'potterhy',
      roles: [Role.TUTOR],
    });
  });
});
