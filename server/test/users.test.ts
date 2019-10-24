import request from 'supertest';
import app from './TestApp';
import { connectToDB, disconnectFromDB } from './util/connectToDB';

describe('GET /user', () => {
  const agent = request.agent(app);

  beforeAll(connectToDB, 10 * 60 * 1000);

  afterAll(disconnectFromDB);

  test('TEST LOGIN', done => {
    return agent
      .post('/api/login')
      .send({})
      .auth('admin', 'admin', { type: 'basic' })
      .expect(200, done);
  });

  test.todo('GET /user');
});
