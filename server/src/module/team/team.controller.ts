import { Controller, Get, Param, Post, UsePipes, ValidationPipe, Body } from '@nestjs/common';
import { Team } from '../../shared/model/Team';
import { TeamService } from './team.service';
import { TeamDTO } from './team.dto';

@Controller('tutorial/:id/team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  // TODO: Add guards!

  @Get()
  async getAllTeamsInTutorial(@Param('id') tutorialId: string): Promise<Team[]> {
    const teams = await this.teamService.findAllTeamsInTutorial(tutorialId);

    return teams;
  }

  @Post()
  @UsePipes(ValidationPipe)
  async createTeamInTutorial(@Param('id') tutorialId: string, @Body() dto: TeamDTO): Promise<Team> {
    const team = await this.teamService.createTeamInTutorial(tutorialId, dto);

    return team;
  }

  @Get('/:teamId')
  async getTeamInTutorial(
    @Param('id') tutorialId: string,
    @Param('teamId') teamId: string
  ): Promise<Team> {
    const team = await this.teamService.findById({ tutorialId, teamId });

    return team.toDTO();
  }
}
