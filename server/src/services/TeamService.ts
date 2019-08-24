import { DocumentNotFoundError } from '../model/Errors';
import { getIdOfDocumentRef } from '../helpers/documentHelpers';
import { Team, TeamDTO } from 'shared/dist/model/Team';
import { TeamDocument } from '../model/documents/TeamDocument';
import studentService from './StudentService';
import { Student } from 'shared/dist/model/Student';
import StudentModel, { StudentDocument } from '../model/documents/StudentDocument';
import { CollectionName } from '../model/CollectionName';

class TeamService {
  public async getAllTeams(): Promise<Team[]> {
    throw new Error('[TeamService] -- Not implemented yet.');
  }

  public async createTeam(dto: TeamDTO): Promise<Team> {
    throw new Error('[TeamService] -- Not implemented yet.');
  }

  public async updateTeam(id: string, dto: TeamDTO): Promise<Team> {
    throw new Error('[TeamService] -- Not implemented yet.');
  }

  public async deleteTeam(id: string): Promise<TeamDocument> {
    throw new Error('[TeamService] -- Not implemented yet.');
  }

  public async getTeamWithId(id: string): Promise<Team> {
    const team: TeamDocument | null = await this.getTeamDocumentWithId(id);

    return this.getTeamOrReject(team);
  }

  private async getTeamDocumentWithId(id: string): Promise<TeamDocument> {
    const student: StudentDocument | null = await StudentModel.findById(id).populate(
      CollectionName.TUTORIAL,
      CollectionName.STUDENT
    );

    if (!student) {
      return this.rejectTeamNotFound();
    }

    return student;
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
