import request from 'supertest';
import app from './TestApp';
import { connectToDB, disconnectFromDB } from './util/connectToDB';
import { CreateUserDTO } from 'shared/dist/model/User';
import { Role } from 'shared/dist/model/Role';

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
  // test('TEST LOGIN', done => {
  //   return agent
  //     .post('/api/login')
  //     .send({})
  //     .auth('admin', 'admin', { type: 'basic' })
  //     .expect(200, done);
  // });

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

    return agent
      .post('/api/user')
      .send(userToCreate)
      .expect(200, userToCreate, done);
  });

  test.todo('Create a user with one tutorial');

  test.todo('Create a user with multiple tutorials');
});
