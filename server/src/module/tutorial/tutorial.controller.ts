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
import { HasRoleGuard } from '../../guards/has-role.guard';
import { TutorialGuard } from '../../guards/tutorial.guard';
import { Role } from '../../shared/model/Role';
import { Tutorial } from '../../shared/model/Tutorial';
import { TutorialDTO } from './tutorial.dto';
import { TutorialService } from './tutorial.service';

@Controller('tutorial')
export class TutorialController {
  constructor(private readonly tutorialService: TutorialService) {}

  @Get()
  @UseGuards(new HasRoleGuard([Role.ADMIN, Role.EMPLOYEE]))
  async getAllTutorials(): Promise<Tutorial[]> {
    const tutorials: Tutorial[] = await this.tutorialService.findAll();

    return tutorials;
  }

  @Post()
  @UseGuards(new HasRoleGuard(Role.ADMIN))
  @UsePipes(ValidationPipe)
  async createTutorial(@Body() dto: TutorialDTO): Promise<Tutorial> {
    const tutorial = await this.tutorialService.create(dto);

    return tutorial;
  }

  @Get('/:id')
  @UseGuards(TutorialGuard)
  async getTutorial(@Param('id') id: string): Promise<Tutorial> {
    const tutorial = await this.tutorialService.findById(id);

    return tutorial.toDTO();
  }

  @Patch('/:id')
  @UseGuards(new HasRoleGuard(Role.ADMIN))
  @UsePipes(ValidationPipe)
  async updateTutorial(@Param('id') id: string, @Body() dto: TutorialDTO): Promise<Tutorial> {
    const tutorial = await this.tutorialService.update(id, dto);

    return tutorial;
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(new HasRoleGuard(Role.ADMIN))
  async deleteTutorial(@Param('id') id: string): Promise<void> {
    await this.tutorialService.delete(id);
  }
}
