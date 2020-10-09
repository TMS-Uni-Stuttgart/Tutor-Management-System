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
import { Roles } from '../../guards/decorators/roles.decorator';
import { HasRoleGuard } from '../../guards/has-role.guard';
import { StudentGuard } from '../../guards/student.guard';
import { TutorialGuard } from '../../guards/tutorial.guard';
import { FormDataResponse } from '../../shared/model/FormTypes';
import { Role } from '../../shared/model/Role';
import {
  CriteriaInformation,
  IScheinCriteria,
  ScheinCriteriaSummary,
  ScheincriteriaSummaryByStudents,
} from '../../shared/model/ScheinCriteria';
import { ScheinCriteriaDTO } from './scheincriteria.dto';
import { ScheincriteriaService } from './scheincriteria.service';

@Controller('scheincriteria')
export class ScheincriteriaController {
  constructor(private readonly scheincriteriaService: ScheincriteriaService) {}

  @Get()
  @UseGuards(HasRoleGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  async getAllCriterias(): Promise<IScheinCriteria[]> {
    const scheincriterias = await this.scheincriteriaService.findAll();

    return scheincriterias.map((criteria) => criteria.toDTO());
  }

  @Post()
  @UseGuards(HasRoleGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @UsePipes(ValidationPipe)
  async createCriteria(@Body() dto: ScheinCriteriaDTO): Promise<IScheinCriteria> {
    const scheincriteria = await this.scheincriteriaService.create(dto);

    return scheincriteria;
  }

  @Patch('/:id')
  @UseGuards(HasRoleGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @UsePipes(ValidationPipe)
  async updateCriteria(
    @Param('id') id: string,
    @Body() dto: ScheinCriteriaDTO
  ): Promise<IScheinCriteria> {
    const scheincritera = await this.scheincriteriaService.update(id, dto);

    return scheincritera;
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(HasRoleGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  async deleteCriteria(@Param('id') id: string): Promise<void> {
    await this.scheincriteriaService.delete(id);
  }

  @Get('/:id/info')
  @UseGuards(HasRoleGuard)
  async getInformation(@Param('id') id: string): Promise<CriteriaInformation> {
    const information = await this.scheincriteriaService.getInfoAboutCriteria(id);

    return information;
  }

  @Get('/form')
  @UseGuards(HasRoleGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  async getFormData(): Promise<FormDataResponse> {
    const formData = await this.scheincriteriaService.getFormData();

    return formData;
  }

  @Get('/student')
  @UseGuards(HasRoleGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  async getResultsOfAllStudents(): Promise<ScheincriteriaSummaryByStudents> {
    const summary = await this.scheincriteriaService.getResultsOfAllStudents();

    return summary;
  }

  @Get('/student/:id')
  @UseGuards(StudentGuard)
  async getResultOfStudent(@Param('id') id: string): Promise<ScheinCriteriaSummary> {
    const summary = await this.scheincriteriaService.getResultOfStudent(id);

    return summary;
  }

  @Get('/tutorial/:id')
  @UseGuards(TutorialGuard)
  async getResultsOfTutorial(@Param('id') id: string): Promise<ScheincriteriaSummaryByStudents> {
    const summary = await this.scheincriteriaService.getResultsOfTutorial(id);

    return summary;
  }
}
