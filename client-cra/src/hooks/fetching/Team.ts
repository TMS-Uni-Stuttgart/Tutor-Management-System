import { plainToClass } from 'class-transformer';
import { IGradingDTO } from 'shared/model/Gradings';
import { ITeam, ITeamDTO } from 'shared/model/Team';
import { Team } from '../../model/Team';
import axios from './Axios';

function sortStudentsOfTeam(team: Team) {
  team.students.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getTeamsOfTutorial(tutorialId: string): Promise<Team[]> {
  const response = await axios.get<ITeam[]>(`tutorial/${tutorialId}/team`);

  if (response.status === 200) {
    const data = plainToClass(Team, response.data);
    data.forEach((team) => sortStudentsOfTeam(team));
    data.sort((a, b) => a.teamNo - b.teamNo);

    return data;
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function getTeamOfTutorial(tutorialId: string, teamId: string): Promise<Team> {
  const response = await axios.get<ITeam>(`tutorial/${tutorialId}/team/${teamId}`);

  if (response.status === 200) {
    const data = plainToClass(Team, response.data);
    sortStudentsOfTeam(data);

    return data;
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function createTeam(tutorialId: string, teamInfo: ITeamDTO): Promise<Team> {
  const response = await axios.post<ITeam>(`tutorial/${tutorialId}/team`, teamInfo);

  if (response.status === 201) {
    const data = plainToClass(Team, response.data);
    sortStudentsOfTeam(data);

    return data;
  }

  return Promise.reject(`Wrong status code (${response.status}).`);
}

export async function editTeam(
  tutorialId: string,
  teamId: string,
  teamInfo: ITeamDTO
): Promise<Team> {
  const response = await axios.patch<ITeam>(`tutorial/${tutorialId}/team/${teamId}`, teamInfo);

  if (response.status === 200) {
    const data = plainToClass(Team, response.data);
    sortStudentsOfTeam(data);

    return data;
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
