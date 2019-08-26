import { Student } from 'shared/dist/model/Student';
import { Team, TeamDTO } from 'shared/dist/model/Team';
import { getIdOfDocumentRef } from '../helpers/documentHelpers';
import { TeamDocument, TeamSchema } from '../model/documents/TeamDocument';
import { DocumentNotFoundError } from '../model/Errors';
import { TutorialDocument } from '../model/documents/TutorialDocument';
import tutorialService from './TutorialService';
import { Typegoose } from 'typegoose';

class TeamService {
  public async getAllTeams(tutorialId: string): Promise<Team[]> {
    const { teams: teamDocs }: TutorialDocument = await tutorialService.getTutorialDocumentWithID(
      tutorialId
    );

    const teams: Team[] = [];

    for (const doc of teamDocs) {
      teams.push(await this.getTeamOrReject(doc));
    }

    return teams;
  }

  public async createTeam(tutorialId: string, { teamNo, students }: TeamDTO): Promise<Team> {
    const tutorial = await tutorialService.getTutorialDocumentWithID(tutorialId);

    // TODO: Adjust student
    // TODO: Adjust tutorial
    const team: Omit<TeamSchema, keyof Typegoose> = {
      tutorial,
      students: [],
      points: {},
      teamNo: teamNo,
    };
    tutorial.teams.push(team);

    await tutorial.save();

    const createdTeam = tutorial.teams[tutorial.teams.length - 1];

    return this.getTeamOrReject(createdTeam);
  }

  public async updateTeam(tutorialId: string, teamId: string, dto: TeamDTO): Promise<Team> {
    throw new Error('[TeamService] -- Not implemented yet.');
  }

  public async deleteTeam(tutorialId: string, teamId: string): Promise<TeamDocument> {
    const team: TeamDocument = await this.getTeamDocumentWithId(tutorialId, teamId);

    // TODO: Adjust students
    // TODO: Adjust tutorial

    return team.remove();
  }

  public async getTeamWithId(tutorialId: string, id: string): Promise<Team> {
    const team: TeamDocument | null = await this.getTeamDocumentWithId(tutorialId, id);

    return this.getTeamOrReject(team);
  }

  private async getTeamDocumentWithId(tutorialId: string, id: string): Promise<TeamDocument> {
    throw new Error('[TeamService] -- Not implemented yet.');
  }

  private async getTeamOrReject(team: TeamDocument | null): Promise<Team> {
    if (!team) {
      return this.rejectTeamNotFound();
    }

    const { _id, teamNo, tutorial, students: studentDocs, points } = team;

    // TODO: Convert students to Student[]
    const students: Student[] = [];

    return {
      id: _id,
      teamNo,
      tutorial: getIdOfDocumentRef(tutorial),
      students,
      points,
    };
  }

  private async rejectTeamNotFound(): Promise<any> {
    return Promise.reject(new DocumentNotFoundError('Team with that ID was not found.'));
  }
}

const teamService = new TeamService();

export default teamService;
