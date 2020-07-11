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
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AllowCorrectors } from '../../guards/decorators/allowCorrectors.decorator';
import { AllowSubstitutes } from '../../guards/decorators/allowSubstitutes.decorator';
import { Roles } from '../../guards/decorators/roles.decorator';
import { HasRoleGuard } from '../../guards/has-role.guard';
import { TutorialGuard } from '../../guards/tutorial.guard';
import { Role } from '../../shared/model/Role';
import { IStudent } from '../../shared/model/Student';
import { ITutorial } from '../../shared/model/Tutorial';
import { SubstituteDTO, TutorialDTO, TutorialGenerationDTO } from './tutorial.dto';
import { TutorialService } from './tutorial.service';
import { ClassTransformerPipe } from '../../pipes/class-transformer.pipe';

@Controller('tutorial')
export class TutorialController {
  constructor(private readonly tutorialService: TutorialService) {}

  @Get()
  @UseGuards(HasRoleGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  async getAllTutorials(): Promise<ITutorial[]> {
    const tutorials = await this.tutorialService.findAll();

    return tutorials.map((tutorial) => tutorial.toDTO());
  }

  @Post()
  @UseGuards(HasRoleGuard)
  @UsePipes(ValidationPipe)
  async createTutorial(@Body() dto: TutorialDTO): Promise<ITutorial> {
    const tutorial = await this.tutorialService.create(dto);

    return tutorial;
  }

  @Post('/generate')
  @UseGuards(HasRoleGuard)
  @UsePipes(ClassTransformerPipe)
  async createManyTutorials(@Body() dto: TutorialGenerationDTO): Promise<ITutorial[]> {
    const tutorials = await this.tutorialService.createMany(dto);

    return tutorials;
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
  @UseGuards(HasRoleGuard)
  @UsePipes(ValidationPipe)
  async updateTutorial(@Param('id') id: string, @Body() dto: TutorialDTO): Promise<ITutorial> {
    const tutorial = await this.tutorialService.update(id, dto);

    return tutorial;
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(HasRoleGuard)
  async deleteTutorial(@Param('id') id: string): Promise<void> {
    await this.tutorialService.delete(id);
  }

  @Get('/:id/student')
  @UseGuards(TutorialGuard)
  @AllowSubstitutes()
  @AllowCorrectors()
  async getAllStudentsOfTutorial(@Param('id') id: string): Promise<IStudent[]> {
    const students = await this.tutorialService.getAllStudentsOfTutorial(id);

    return students.map((s) => s.toDTO());
  }

  @Put('/:id/substitute')
  @UseGuards(HasRoleGuard)
  @UsePipes(ValidationPipe)
  async setSubstituteOfTutorial(
    @Param('id') id: string,
    @Body() dto: SubstituteDTO | SubstituteDTO[]
  ): Promise<void> {
    if (Array.isArray(dto)) {
      await this.tutorialService.setMultipleSubstitutes(id, dto);
    } else {
      await this.tutorialService.setSubstitute(id, dto);
    }
  }
}
