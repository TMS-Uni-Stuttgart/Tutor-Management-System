import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { AllowCorrectors } from '../../guards/decorators/allowCorrectors.decorator';
import { AllowSubstitutes } from '../../guards/decorators/allowSubstitutes.decorator';
import { TeamGuard } from '../../guards/team.guard';
import { ITeam } from 'shared/model/Team';
import { TeamDTO } from './team.dto';
import { TeamService } from './team.service';

@Controller('tutorial/:id/team')
export class TeamController {
    constructor(private readonly teamService: TeamService) {}

    @Get()
    @UseGuards(TeamGuard)
    @AllowSubstitutes()
    @AllowCorrectors()
    async getAllTeamsInTutorial(@Param('id') tutorialId: string): Promise<ITeam[]> {
        const teams = await this.teamService.findAllTeamsInTutorial(tutorialId);

        return teams.map((team) => team.toDTO());
    }

    @Post()
    @UseGuards(TeamGuard)
    @UsePipes(ValidationPipe)
    async createTeamInTutorial(
        @Param('id') tutorialId: string,
        @Body() dto: TeamDTO
    ): Promise<ITeam> {
        return await this.teamService.createTeamInTutorial(tutorialId, dto);
    }

    @Get('/:teamId')
    @UseGuards(TeamGuard)
    @AllowSubstitutes()
    @AllowCorrectors()
    async getTeamInTutorial(
        @Param('id') tutorialId: string,
        @Param('teamId') teamId: string
    ): Promise<ITeam> {
        const team = await this.teamService.findById({ tutorialId, teamId });

        return team.toDTO();
    }

    @Patch('/:teamId')
    @UseGuards(TeamGuard)
    @AllowCorrectors()
    @UsePipes(ValidationPipe)
    async updateTeamInTutorial(
        @Param('id') tutorialId: string,
        @Param('teamId') teamId: string,
        @Body() dto: TeamDTO
    ): Promise<ITeam> {
        return await this.teamService.updateTeamInTutorial({ tutorialId, teamId }, dto);
    }

    @Delete('/:teamId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(TeamGuard)
    async deleteTeamFromTutorial(
        @Param('id') tutorialId: string,
        @Param('teamId') teamId: string
    ): Promise<void> {
        await this.teamService.deleteTeamFromTutorial({ tutorialId, teamId });
    }
}
