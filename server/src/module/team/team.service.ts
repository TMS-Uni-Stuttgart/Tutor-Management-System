import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { TeamModel, populateTeamDocument, TeamDocument } from '../../database/models/team.model';
import { Team } from '../../shared/model/Team';
import { ReturnModelType } from '@typegoose/typegoose';
import { TeamDTO } from './team.dto';
import { TutorialService } from '../tutorial/tutorial.service';
import { TutorialDocument } from '../../database/models/tutorial.model';
import { StudentService } from '../student/student.service';

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

    await Promise.all(
      studentDocs.map(student => {
        student.team = created;

        return student.save();
      })
    );

    const teamWithStudents = await this.findById({ tutorialId, teamId: created.id });
    return teamWithStudents.toDTO();
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
