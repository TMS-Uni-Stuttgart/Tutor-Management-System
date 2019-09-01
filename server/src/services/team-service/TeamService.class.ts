import { Student } from 'shared/dist/model/Student';
import { Team, TeamDTO } from 'shared/dist/model/Team';
import { Typegoose } from 'typegoose';
import { isDocument } from 'typegoose/lib/utils';
import { getIdOfDocumentRef } from '../../helpers/documentHelpers';
import { TeamDocument, TeamSchema } from '../../model/documents/TeamDocument';
import { TutorialDocument } from '../../model/documents/TutorialDocument';
import { DocumentNotFoundError } from '../../model/Errors';
import studentService from '../student-service/StudentService.class';
import tutorialService from '../tutorial-service/TutorialService.class';

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

  public async updateTeam(
    tutorialId: string,
    teamId: string,
    { teamNo, students }: TeamDTO
  ): Promise<Team> {
    const team: TeamDocument = await this.getTeamDocumentWithId(tutorialId, teamId);

    // TODO: Adjust students
    // TODO: Adjust tutorial

    team.teamNo = teamNo;

    return this.getTeamOrReject(await team.save());
  }

  public async deleteTeam(tutorialId: string, teamId: string): Promise<Team> {
    const team: TeamDocument = await this.getTeamDocumentWithId(tutorialId, teamId);

    // TODO: Adjust students
    // TODO: Adjust tutorial

    return this.getTeamOrReject(await team.remove());
  }

  public async getTeamWithId(tutorialId: string, id: string): Promise<Team> {
    const team: TeamDocument | null = await this.getTeamDocumentWithId(tutorialId, id);

    return this.getTeamOrReject(team);
  }

  private async getTeamDocumentWithId(tutorialId: string, id: string): Promise<TeamDocument> {
    const tutorial = await tutorialService.getTutorialDocumentWithID(tutorialId);
    const idx = tutorial.teams.findIndex(doc => doc._id.toString() === id);

    if (idx < 0) {
      return this.rejectTeamNotFound();
    }

    // TODO: Test if population works or if an additional 'populatedTutorial' variable is needed.
    await tutorial.populate(`teams.${idx}.students`).execPopulate();

    return tutorial.teams[idx];
  }

  private async getTeamOrReject(team: TeamDocument | null): Promise<Team> {
    if (!team) {
      return this.rejectTeamNotFound();
    }

    const { _id, teamNo, tutorial, students: studentDocs, points } = team;

    // TODO: Test if conversion works.
    const students: Promise<Student>[] = [];

    for (const doc of studentDocs) {
      if (isDocument(doc)) {
        students.push(studentService.getStudentOrReject(doc));
      }
    }

    return {
      id: _id,
      teamNo,
      tutorial: getIdOfDocumentRef(tutorial),
      students: await Promise.all(students),
      points,
    };
  }

  private async rejectTeamNotFound(): Promise<any> {
    return Promise.reject(new DocumentNotFoundError('Team with that ID was not found.'));
  }
}

const teamService = new TeamService();

export default teamService;
