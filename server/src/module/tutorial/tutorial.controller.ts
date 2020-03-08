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
  Put,
} from '@nestjs/common';
import { HasRoleGuard } from '../../guards/has-role.guard';
import { TutorialGuard } from '../../guards/tutorial.guard';
import { Role } from '../../shared/model/Role';
import { ITutorial } from '../../shared/model/Tutorial';
import { TutorialDTO, SubstituteDTO } from './tutorial.dto';
import { TutorialService } from './tutorial.service';
import { IStudent } from '../../shared/model/Student';
import { AllowSubstitutes } from '../../guards/decorators/allowSubstitutes.decorator';
import { AllowCorrectors } from '../../guards/decorators/allowCorrectors.decorator';

@Controller('tutorial')
export class TutorialController {
  constructor(private readonly tutorialService: TutorialService) {}

  @Get()
  @UseGuards(new HasRoleGuard([Role.ADMIN, Role.EMPLOYEE]))
  async getAllTutorials(): Promise<ITutorial[]> {
    const tutorials = await this.tutorialService.findAll();

    return tutorials.map(tutorial => tutorial.toDTO());
  }

  @Post()
  @UseGuards(new HasRoleGuard(Role.ADMIN))
  @UsePipes(ValidationPipe)
  async createTutorial(@Body() dto: TutorialDTO): Promise<ITutorial> {
    const tutorial = await this.tutorialService.create(dto);

    return tutorial;
  }

  @Get('/:id')
  @UseGuards(TutorialGuard)
  @AllowSubstitutes()
  @AllowCorrectors()
  async getTutorial(@Param('id') id: string): Promise<ITutorial> {
    const tutorial = await this.tutorialService.findById(id);

    return tutorial.toDTO();
  }

  @Patch('/:id')
  @UseGuards(new HasRoleGuard(Role.ADMIN))
  @UsePipes(ValidationPipe)
  async updateTutorial(@Param('id') id: string, @Body() dto: TutorialDTO): Promise<ITutorial> {
    const tutorial = await this.tutorialService.update(id, dto);

    return tutorial;
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(new HasRoleGuard(Role.ADMIN))
  async deleteTutorial(@Param('id') id: string): Promise<void> {
    await this.tutorialService.delete(id);
  }

  @Get('/:id/student')
  @UseGuards(TutorialGuard)
  @AllowSubstitutes()
  @AllowCorrectors()
  async getAllStudentsOfTutorial(@Param('id') id: string): Promise<IStudent[]> {
    const students = await this.tutorialService.getAllStudentsOfTutorial(id);

    return students.map(s => s.toDTO());
  }

  @Put('/:id/substitute')
  @UseGuards(new HasRoleGuard(Role.ADMIN))
  @UsePipes(ValidationPipe)
  async setSubstituteOfTutorial(
    @Param('id') id: string,
    @Body() dto: SubstituteDTO
  ): Promise<ITutorial> {
    const updated = await this.tutorialService.setSubstitute(id, dto);

    return updated;
  }
}
