import { UpdatePointsDTO } from 'shared/dist/model/Points';
import { Team, TeamDTO } from 'shared/dist/model/Team';
import axios from './Axios';

function sortStudentsOfTeam(team: Team) {
  team.students = team.students.sort((a, b) =>
    `${a.lastname}, ${a.firstname}`.localeCompare(`${b.lastname}, ${b.firstname}`)
  );
}

export async function getTeamsOfTutorial(tutorialId: string): Promise<Team[]> {
  const response = await axios.get<Team[]>(`tutorial/${tutorialId}/team`);

  if (response.status === 200) {
    response.data.forEach(team => sortStudentsOfTeam(team));

    return response.data;
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function getTeamOfTutorial(tutorialId: string, teamId: string): Promise<Team> {
  const response = await axios.get<Team>(`tutorial/${tutorialId}/team/${teamId}`);

  if (response.status === 200) {
    sortStudentsOfTeam(response.data);

    return response.data;
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function createTeam(tutorialId: string, teamInfo: TeamDTO): Promise<Team> {
  const response = await axios.post<Team>(`tutorial/${tutorialId}/team`, teamInfo);

  if (response.status === 201) {
    sortStudentsOfTeam(response.data);

    return response.data;
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function editTeam(
  tutorialId: string,
  teamId: string,
  teamInfo: TeamDTO
): Promise<Team> {
  const response = await axios.patch<Team>(`tutorial/${tutorialId}/team/${teamId}`, teamInfo);

  if (response.status === 200) {
    sortStudentsOfTeam(response.data);

    return response.data;
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function deleteTeam(tutorialId: string, teamId: string): Promise<void> {
  const response = await axios.delete(`tutorial/${tutorialId}/team/${teamId}`);

  if (response.status !== 204) {
    return Promise.reject(`Wrong status code (${response.status}).`);
  }
}

export async function setPointsOfTeam(
  tutorialId: string,
  teamId: string,
  points: UpdatePointsDTO
): Promise<void> {
  const response = await axios.put(`tutorial/${tutorialId}/team/${teamId}/points`, points);

  if (response.status !== 204) {
    return Promise.reject(`Wrong status code (${response.status}).`);
  }
}
