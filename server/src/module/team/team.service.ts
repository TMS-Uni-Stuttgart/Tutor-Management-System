import { Injectable, NotFoundException } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { StudentDocument } from '../../database/models/student.model';
import { populateTeamDocument, TeamDocument, TeamModel } from '../../database/models/team.model';
import { TutorialDocument } from '../../database/models/tutorial.model';
import { Team } from '../../shared/model/Team';
import { StudentService } from '../student/student.service';
import { TutorialService } from '../tutorial/tutorial.service';
import { TeamDTO } from './team.dto';

interface TeamID {
  tutorialId: string;
  teamId: string;
}

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(TeamModel)
    private readonly teamModel: ReturnModelType<typeof TeamModel>,
    private readonly tutorialService: TutorialService,
    private readonly studentService: StudentService
  ) {}

  /**
   * @param tutorialId Tutorial ID to get teams for
   *
   * @returns All teams in the given tutorial.
   */
  async findAllTeamsInTutorial(tutorialId: string): Promise<Team[]> {
    const teams = await this.teamModel.find({ tutorial: tutorialId }).exec();

    await Promise.all(teams.map(team => populateTeamDocument(team)));

    return teams.map(team => team.toDTO());
  }

  /**
   * Searches the team with the given ID which is in the given tutorial and returns it.
   *
   * @param teamId ID consisting of tutorialId and teamId to find the corresponding team.
   *
   * @returns Team in the given tutorial with the given teamId.
   *
   * @throws `NotFoundException` - If no team inside the given tutorial with the given ID could be found.
   */
  async findById({ tutorialId, teamId }: TeamID): Promise<TeamDocument> {
    const team = await this.teamModel.findOne({ _id: teamId, tutorial: tutorialId }).exec();

    if (!team) {
      throw new NotFoundException(
        `Could not find the team with the ID '${teamId}' in the tutorial with the ID ${tutorialId}`
      );
    }

    return team;
  }

  /**
   * Creates a team in the given tutorial with the given information from the DTO.
   *
   * This functions also updates all students in the dto to have the newly created team.
   *
   * @param tutorialId Tutorial to create team in.
   * @param dto Information to create the team with.
   *
   * @returns Created team.
   *
   * @throws `NotFoundException` - If no tutorial with the given ID could be found or if any student provided by the DTO could not be found.
   */
  async createTeamInTutorial(tutorialId: string, { students }: TeamDTO): Promise<Team> {
    const tutorial = await this.tutorialService.findById(tutorialId);
    const studentDocs = await Promise.all(students.map(id => this.studentService.findById(id)));
    const team = new TeamModel({
      tutorial,
      teamNo: this.getFirstAvailableTeamNo(tutorial),
    });

    const created = await this.teamModel.create(team);

    await this.addAllStudentToTeam(created, studentDocs);

    const teamWithStudents = await this.findById({ tutorialId, teamId: created.id });
    return teamWithStudents.toDTO();
  }

  /**
   * Updates the given team in the tutorial with the given information.
   *
   * This function updates all students related to the team in the following way:
   * - All previously assigned students get their team removed and be saved back to the DB.
   * - All students provided by the DTO will get their team assigned and be saved back to the DB.
   *
   * @param teamId ID of the team inside a tutorial to update.
   * @param dto Information to update the team with.
   *
   * @returns Updated team.
   *
   * @throws `NotFoundException` - If not team with the given ID could be found in the tutorial or if any of the provided students in the DTO could not be found.
   */
  async updateTeamInTutorial(teamId: TeamID, { students }: TeamDTO): Promise<Team> {
    const team = await this.findById(teamId);
    const newStudentsOfTeam = await Promise.all(
      students.map(id => this.studentService.findById(id))
    );

    await this.removeAllStudentsFromTeam(team);
    await this.addAllStudentToTeam(team, newStudentsOfTeam);

    const updated = await this.findById(teamId);

    return updated.toDTO();
  }

  /**
   * Deletes the given team from the given tutorial (and the DB). This function also removes the team from all associated students.
   *
   * @param teamId ID of the team to delete in the tutorial.
   *
   * @returns Deleted TeamDocument.
   *
   * @throws `NotFoundException` - If no team with the given ID could be found in the given tutorial.
   */
  async deleteTeamFromTutorial(teamId: TeamID): Promise<TeamDocument> {
    const team = await this.findById(teamId);

    await this.removeAllStudentsFromTeam(team);

    return team.remove();
  }

  /**
   * Adds all the given students to the team by setting their `team` property to the given team. The students are saved to the DB, afterwards.
   *
   * @param team Team to add students to.
   * @param students Students to add the team to.
   *
   * @returns All updated StudentDocuments.
   */
  private async addAllStudentToTeam(
    team: TeamDocument,
    students: StudentDocument[]
  ): Promise<StudentDocument[]> {
    return Promise.all(
      students.map(student => {
        student.team = team;
        student.markModified('team');

        return student.save();
      })
    );
  }

  /**
   * Removes all students from the given team by removing their `team` property. They are saved to the DB, afterwards.
   *
   * @param team Team to remove all students from.
   *
   * @returns All updated StudentDocuments.
   */
  private async removeAllStudentsFromTeam(team: TeamDocument): Promise<StudentDocument[]> {
    return Promise.all(
      team.students.map(student => {
        student.team = undefined;
        student.markModified('team');

        return student.save();
      })
    );
  }

  /**
   * Returns the first available team number in the given tutorial.
   *
   * Team numbers are ascending numbers. However, this function will try to fill holes in the numbering first.
   *
   * @param tutorial Tutorial of the team.
   *
   * @returns First available team number in the tutorial.
   */
  private getFirstAvailableTeamNo(tutorial: TutorialDocument): number {
    for (let i = 1; i <= tutorial.teams.length; i++) {
      let isTeamNoInUse = false;

      for (const team of tutorial.teams) {
        if (team.teamNo === i) {
          isTeamNoInUse = true;
          break;
        }
      }

      if (!isTeamNoInUse) {
        return i;
      }
    }

    return tutorial.teams.length + 1;
  }
}
