import Chance from 'chance';
import _ from 'lodash';
import { Team, TeamDTO } from 'shared/dist/model/Team';
import { TutorialDTO } from 'shared/dist/model/Tutorial';
import request from 'supertest';
import studentService from '../src/services/student-service/StudentService.class';
import teamService from '../src/services/team-service/TeamService.class';
import app from './util/Test.App';
import { assertTeamToMatchTeamDTO } from './util/Test.Assertions';
import { connectToDB, disconnectFromDB } from './util/Test.connectToDB';

const agent = request.agent(app);
const chance = new Chance();

let tutorialId: string = 'NOT_GENERATED_YET';

beforeAll(async done => {
  await connectToDB();

  await agent
    .post('/api/login')
    .send({})
    .auth('admin', 'admin', { type: 'basic' });

  const tutorialToCreate: TutorialDTO = {
    startTime: '09:45:00',
    endTime: '11:15:00',
    slot: 'T1',
    dates: [new Date(Date.now()).toDateString()],
    correctorIds: [],
    tutorId: undefined,
  };

  const response = await agent.post('/api/tutorial').send(tutorialToCreate);

  tutorialId = response.body.id;

  done();
}, 10 * 60 * 1000);

afterAll(disconnectFromDB);

describe('GET /team[/:id]', () => {
  test('Get all teams in a tutorial', async done => {
    for (let i = 0; i < 3; i++) {
      await teamService.createTeam(tutorialId, { students: [] });
    }

    const teamList = (await teamService.getAllTeams(tutorialId))
      .map(u => JSON.stringify(u))
      .map(u => JSON.parse(u) as Team);
    const response = await agent.get(`/api/tutorial/${tutorialId}/team`);

    expect(response.status).toBe(200);

    response.body.sort((a: Team, b: Team) => a.teamNo - b.teamNo);
    teamList.sort((a, b) => a.teamNo - b.teamNo);

    expect(response.body).toEqual(teamList);

    done();
  });

  test('Get a specific team in a tutorial', async done => {
    const students = await generateStudents(3);
    const teamDTO: TeamDTO = {
      students,
    };
    const team = await teamService.createTeam(tutorialId, teamDTO);

    const response = await agent.get(`/api/tutorial/${tutorialId}/team/${team.id}`);

    expect(response.status).toBe(200);
    assertTeamToMatchTeamDTO({ expectedTeam: teamDTO, tutorialId }, response.body);

    done();
  });
});

describe('POST /team', () => {
  test('Create an empty team in a tutorial.', async done => {
    const expectedTeam = { students: [] };

    addTeamToDatabase(expectedTeam, tutorialId, done);
  });

  test('Create a team with one or more students in a tutorial.', async done => {
    const students = await generateStudents(3);
    const expectedTeam: TeamDTO = { students };

    addTeamToDatabase(expectedTeam, tutorialId, done);
  });
});

describe('PATCH /team/:id', () => {
  test('Add students without a team to a team.', async done => {
    const students = await generateStudents(2);
    const team = await teamService.createTeam(tutorialId, { students: [] });
    const expectedTeam: TeamDTO = { students };

    const response = await agent
      .patch(`/api/tutorial/${tutorialId}/team/${team.id}`)
      .send(expectedTeam);
    const actualTeam: Team = response.body;

    expect(response.status).toBe(200);
    assertTeamToMatchTeamDTO({ expectedTeam, tutorialId }, actualTeam);

    expect(actualTeam.teamNo).toBe(team.teamNo);
    expect(actualTeam.id).toBe(team.id);
    expect(actualTeam.points).toEqual(team.points);

    for (const studentId of students) {
      const student = await studentService.getStudentWithId(studentId);

      expect(student.team && student.team.id).toBe(actualTeam.id);
    }

    done();
  });

  test('Add students with a team to a team.', async done => {
    // Generate students and add them to a team.
    const prevTeam = await teamService.createTeam(tutorialId, { students: [] });
    const students = await generateStudents(2, prevTeam.id);

    const team = await teamService.createTeam(tutorialId, { students: [] });
    const expectedTeam: TeamDTO = { students };

    const response = await agent
      .patch(`/api/tutorial/${tutorialId}/team/${team.id}`)
      .send(expectedTeam);
    const actualTeam: Team = response.body;

    expect(response.status).toBe(200);
    assertTeamToMatchTeamDTO({ expectedTeam, tutorialId }, actualTeam);

    expect(actualTeam.teamNo).toBe(team.teamNo);
    expect(actualTeam.id).toBe(team.id);
    expect(actualTeam.points).toEqual(team.points);

    for (const studentId of students) {
      const student = await studentService.getStudentWithId(studentId);

      expect(student.team && student.team.id).toBe(actualTeam.id);
    }

    done();
  });

  test('Remove some (not all!) students from a team.', async done => {
    const students = await generateStudents(4);
    const team = await teamService.createTeam(tutorialId, { students });

    const studentsWithATeam = [students[0], students[3]];
    const studentsWithoutATeam = _.difference(students, studentsWithATeam);
    const expectedTeam: TeamDTO = { students: studentsWithATeam };

    const response = await agent
      .patch(`/api/tutorial/${tutorialId}/team/${team.id}`)
      .send(expectedTeam);
    const actualTeam: Team = response.body;

    expect(response.status).toBe(200);
    assertTeamToMatchTeamDTO({ expectedTeam, tutorialId }, actualTeam);

    expect(actualTeam.teamNo).toBe(team.teamNo);
    expect(actualTeam.id).toBe(team.id);
    expect(actualTeam.points).toEqual(team.points);

    for (const studentId of studentsWithATeam) {
      const student = await studentService.getStudentWithId(studentId);

      expect(student.team && student.team.id).toBe(actualTeam.id);
    }

    for (const studentId of studentsWithoutATeam) {
      const student = await studentService.getStudentWithId(studentId);

      expect(student.team).toBeUndefined();
    }

    done();
  });

  test('Remove all students from a team.', async done => {
    const students = await generateStudents(4);
    const team = await teamService.createTeam(tutorialId, { students });

    const expectedTeam: TeamDTO = { students: [] };

    const response = await agent
      .patch(`/api/tutorial/${tutorialId}/team/${team.id}`)
      .send(expectedTeam);
    const actualTeam: Team = response.body;

    expect(response.status).toBe(200);
    assertTeamToMatchTeamDTO({ expectedTeam, tutorialId }, actualTeam);

    expect(actualTeam.teamNo).toBe(team.teamNo);
    expect(actualTeam.id).toBe(team.id);
    expect(actualTeam.points).toEqual(team.points);

    for (const studentId of students) {
      const student = await studentService.getStudentWithId(studentId);

      expect(student.team).toBeUndefined();
    }

    done();
  });
});

describe('DELETE /team/:id', () => {
  test('Delete an empty team.', async done => {
    const team = await teamService.createTeam(tutorialId, { students: [] });

    const response = await agent.delete(`/api/tutorial/${tutorialId}/team/${team.id}`);
    const newTeamList = await teamService.getAllTeams(tutorialId);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
    expect(newTeamList).not.toContainEqual(team);

    done();
  });

  test('Delete a team with students.', async done => {
    const students = await generateStudents(2);
    const team = await teamService.createTeam(tutorialId, { students });

    const response = await agent.delete(`/api/tutorial/${tutorialId}/team/${team.id}`);
    const newTeamList = await teamService.getAllTeams(tutorialId);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
    expect(newTeamList).not.toContainEqual(team);

    for (const studentId of students) {
      const student = await studentService.getStudentWithId(studentId);

      expect(student.team).toBeUndefined();
    }

    done();
  });
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
  assertTeamToMatchTeamDTO({ expectedTeam: teamToCreate, tutorialId }, response.body);

  done();
}

async function generateStudents(count: number, team?: string): Promise<string[]> {
  const students: string[] = [];
  for (let i = 0; i < count; i++) {
    const [firstname, lastname] = chance.name().split(' ');
    const email = chance.email();
    const matriculationNo = chance.natural({ min: 1000000, max: 9999999 }).toString();

    const student = await studentService.createStudent({
      tutorial: tutorialId,
      courseOfStudies: 'Computer science',
      firstname,
      lastname,
      email,
      matriculationNo,
      team,
    });

    students.push(student.id);
  }

  return students;
}
