import {
  Controller,
  Get,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
  Body,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Team } from '../../shared/model/Team';
import { TeamService } from './team.service';
import { TeamDTO } from './team.dto';
import { TeamGuard } from '../../guards/team.guard';

@Controller('tutorial/:id/team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  // TODO: Add guards!

  @Get()
  @UseGuards(TeamGuard)
  async getAllTeamsInTutorial(@Param('id') tutorialId: string): Promise<Team[]> {
    const teams = await this.teamService.findAllTeamsInTutorial(tutorialId);

    return teams;
  }

  @Post()
  @UseGuards(TeamGuard)
  @UsePipes(ValidationPipe)
  async createTeamInTutorial(@Param('id') tutorialId: string, @Body() dto: TeamDTO): Promise<Team> {
    const team = await this.teamService.createTeamInTutorial(tutorialId, dto);

    return team;
  }

  @Get('/:teamId')
  @UseGuards(TeamGuard)
  async getTeamInTutorial(
    @Param('id') tutorialId: string,
    @Param('teamId') teamId: string
  ): Promise<Team> {
    const team = await this.teamService.findById({ tutorialId, teamId });

    return team.toDTO();
  }

  @Patch('/:teamId')
  @UseGuards(TeamGuard)
  @UsePipes(ValidationPipe)
  async updateTeamInTutorial(
    @Param('id') tutorialId: string,
    @Param('teamId') teamId: string,
    @Body() dto: TeamDTO
  ): Promise<Team> {
    const team = await this.teamService.updateTeamInTutorial({ tutorialId, teamId }, dto);

    return team;
  }

  @Delete('/:teamId')
  @UseGuards(TeamGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTeamFromTutorial(
    @Param('id') tutorialId: string,
    @Param('teamId') teamId: string
  ): Promise<void> {
    await this.teamService.deleteTeamFromTutorial({ tutorialId, teamId });
  }
}
