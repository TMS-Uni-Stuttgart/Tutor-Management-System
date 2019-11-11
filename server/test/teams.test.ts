import request from 'supertest';
import app from './util/Test.App';
import { connectToDB, disconnectFromDB } from './util/Test.connectToDB';
import { TeamDTO } from 'shared/dist/model/Team';

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

describe('GET /team[/:id]', () => {
  test.todo('Get all teams in a tutorial');

  test.todo('Get a specific team in a tutorial');
});

describe('POST /team', () => {
  test.todo('Create an empty team in a tutorial.');

  test.todo('Create a team with one or more students in a tutorial.');
});

describe('PATCH /team/:id', () => {
  test.todo('Add students to a team which had no team.');

  test.todo('Add students to a team which had a team');

  test.todo('Remove some (not all!) student from a team.');

  test.todo('Remove all students from a team.');
});

describe('DELETE /team/:id', () => {
  test.todo('Delete an empty team.');

  test.todo('Delete a team with students.');
});

describe('PUT /team/:id/points', () => {
  test.todo('Update the points of a team.');
});

/**
 * Sends a POST request to create a team with the given information.
 *
 * After receiving a response the response is checked against:
 * - Response having a 201 Status
 * - Response body contains the expected created team information
 *
 * @param teamToCreate TeamDTO to send
 * @param tutorialId ID of the tutorial in which the team should be created
 * @param done Jest done callback
 */
async function addTeamToDatabase(
  teamToCreate: TeamDTO,
  tutorialId: string,
  done: jest.DoneCallback
) {
  const response = await agent.post(`/api/tutorial/${tutorialId}/team`).send(teamToCreate);

  expect(response.status).toBe(201);
  // TODO: Assert created team with expected team

  done();
}
