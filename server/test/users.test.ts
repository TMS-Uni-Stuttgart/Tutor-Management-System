import { Role } from 'shared/dist/model/Role';
import { CreateUserDTO } from 'shared/dist/model/User';
import request from 'supertest';
import tutorialService from '../src/services/tutorial-service/TutorialService.class';
import app from './util/Test.App';
import { assertUserToMatchCreateUserDTO } from './util/Test.Assertions';
import { connectToDB, disconnectFromDB } from './util/Test.connectToDB';

const agent = request.agent(app);

beforeAll(async done => {
  await connectToDB();

  await agent
    .post('/api/login')
    .send({})
    .auth('admin', 'admin', { type: 'basic' });

  done();
}, 10 * 60 * 1000);

afterAll(disconnectFromDB);

describe('GET /user', () => {
  test.todo('GET /user');
});

describe('POST /user', () => {
  test('Create a user without tutorials', done => {
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
      .expect(201, done)
      .expect(assertUserToMatchCreateUserDTO(userToCreate), done);
  });

  test('Create a user with one tutorial', async done => {
    const tutorial = await tutorialService.createTutorial({
      slot: 'T1',
      dates: [new Date().toDateString()],
      startTime: '09:45:00',
      endTime: '11:15:00',
      tutorId: undefined,
      correctorIds: [],
    });

    const userToCreate: CreateUserDTO = {
      firstname: 'Max',
      lastname: 'Mustermann',
      roles: [Role.TUTOR],
      username: 'musterma',
      password: 'password',
      tutorials: [tutorial.id],
      tutorialsToCorrect: [],
      email: 'some@mail.com',
    };

    agent
      .post('/api/user')
      .send(userToCreate)
      .expect(201, done)
      .expect(assertUserToMatchCreateUserDTO(userToCreate), done);
  });

  test('Create a user with multiple tutorials', async done => {
    const tutorialIds: string[] = [];

    for (let i = 0; i < 3; i++) {
      const tutorial = await tutorialService.createTutorial({
        slot: `MultiT${i}`,
        dates: [new Date().toDateString()],
        startTime: '09:45:00',
        endTime: '11:15:00',
        tutorId: undefined,
        correctorIds: [],
      });

      tutorialIds.push(tutorial.id);
    }

    const userToCreate: CreateUserDTO = {
      firstname: 'Sabine',
      lastname: 'Samplewoman',
      roles: [Role.TUTOR],
      username: 'samplese',
      password: 'password',
      tutorials: [...tutorialIds],
      tutorialsToCorrect: [],
      email: 'some@mail.com',
    };

    agent
      .post('/api/user')
      .send(userToCreate)
      .expect(201, done)
      .expect(assertUserToMatchCreateUserDTO(userToCreate), done);
  });
});
