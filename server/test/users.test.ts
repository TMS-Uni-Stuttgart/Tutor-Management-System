import { Role } from 'shared/dist/model/Role';
import { CreateUserDTO, User } from 'shared/dist/model/User';
import request from 'supertest';
import app from './util/Test.App';
import { connectToDB, disconnectFromDB } from './util/Test.connectToDB';
import { generateExpectedUserFromCreateUserDTO } from './util/Test.UserUtil';

const agent = request.agent(app);

beforeAll(async done => {
  await connectToDB();

  await agent
    .post('/api/login')
    .send({})
    .auth('admin', 'admin', { type: 'basic' });
  // .expect(200, done);

  done();
}, 10 * 60 * 1000);

afterAll(disconnectFromDB);

describe('GET /user', () => {
  test.todo('GET /user');
});

describe('POST /user', () => {
  test('Create a user without tutorials', async done => {
    const userToCreate: CreateUserDTO = {
      firstname: 'Tanja',
      lastname: 'Testfrau',
      roles: [Role.TUTOR],
      username: 'testfrta',
      password: 'password',
      tutorials: [],
      tutorialsToCorrect: [],
      email: 'some@mail.com',
    };

    const expectedUser: User = generateExpectedUserFromCreateUserDTO(userToCreate);

    agent
      .post('/api/user')
      .send(userToCreate)
      .expect(res => {
        res.body.id = 'GENERIC_ID';
      })
      .expect(201, expectedUser, done);
  });

  test.todo('Create a user with one tutorial');

  test.todo('Create a user with multiple tutorials');
});
