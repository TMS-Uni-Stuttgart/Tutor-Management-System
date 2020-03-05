import { IGradingDTO } from 'shared/model/Points';
import { ITeam, ITeamDTO } from 'shared/model/Team';
import axios from './Axios';

function sortStudentsOfTeam(team: ITeam) {
  team.students = team.students.sort((a, b) =>
    `${a.lastname}, ${a.firstname}`.localeCompare(`${b.lastname}, ${b.firstname}`)
  );
}

export async function getTeamsOfTutorial(tutorialId: string): Promise<ITeam[]> {
  const response = await axios.get<ITeam[]>(`tutorial/${tutorialId}/team`);

  if (response.status === 200) {
    response.data.forEach(team => sortStudentsOfTeam(team));
    response.data.sort((a, b) => a.teamNo - b.teamNo);

    return response.data;
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function getTeamOfTutorial(tutorialId: string, teamId: string): Promise<ITeam> {
  const response = await axios.get<ITeam>(`tutorial/${tutorialId}/team/${teamId}`);

  if (response.status === 200) {
    sortStudentsOfTeam(response.data);

    return response.data;
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function createTeam(tutorialId: string, teamInfo: ITeamDTO): Promise<ITeam> {
  const response = await axios.post<ITeam>(`tutorial/${tutorialId}/team`, teamInfo);

  if (response.status === 201) {
    sortStudentsOfTeam(response.data);

    return response.data;
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function editTeam(
  tutorialId: string,
  teamId: string,
  teamInfo: ITeamDTO
): Promise<ITeam> {
  const response = await axios.patch<ITeam>(`tutorial/${tutorialId}/team/${teamId}`, teamInfo);

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
  points: IGradingDTO
): Promise<void> {
  const response = await axios.put(`tutorial/${tutorialId}/team/${teamId}/grading`, points);

  if (response.status !== 204) {
    return Promise.reject(`Wrong status code (${response.status}).`);
  }
}
