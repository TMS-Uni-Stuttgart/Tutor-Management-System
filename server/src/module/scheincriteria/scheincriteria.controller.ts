import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { HasRoleGuard } from '../../guards/has-role.guard';
import { StudentGuard } from '../../guards/student.guard';
import { TutorialGuard } from '../../guards/tutorial.guard';
import { FormDataResponse } from '../../shared/model/FormTypes';
import { Role } from '../../shared/model/Role';
import {
  ScheinCriteriaResponse,
  ScheinCriteriaSummary,
  ScheincriteriaSummaryByStudents,
} from '../../shared/model/ScheinCriteria';
import { ScheinCriteriaDTO } from './scheincriteria.dto';
import { ScheincriteriaService } from './scheincriteria.service';

@Controller('scheincriteria')
export class ScheincriteriaController {
  constructor(private readonly scheincriteriaService: ScheincriteriaService) {}

  @Get()
  @UseGuards(new HasRoleGuard([Role.ADMIN, Role.EMPLOYEE]))
  async getAllCriterias(): Promise<ScheinCriteriaResponse[]> {
    const scheincriterias = await this.scheincriteriaService.findAll();

    return scheincriterias.map(criteria => criteria.toDTO());
  }

  @Post()
  @UseGuards(new HasRoleGuard(Role.ADMIN))
  @UsePipes(ValidationPipe)
  async createCriteria(@Body() dto: ScheinCriteriaDTO): Promise<ScheinCriteriaResponse> {
    const scheincriteria = await this.scheincriteriaService.create(dto);

    return scheincriteria;
  }

  @Patch('/:id')
  @UseGuards(new HasRoleGuard(Role.ADMIN))
  @UsePipes(ValidationPipe)
  async updateCriteria(
    @Param('id') id: string,
    @Body() dto: ScheinCriteriaDTO
  ): Promise<ScheinCriteriaResponse> {
    const scheincritera = await this.scheincriteriaService.update(id, dto);

    return scheincritera;
  }

  @Delete('/:id')
  @UseGuards(new HasRoleGuard(Role.ADMIN))
  async deleteCriteria(@Param('id') id: string): Promise<void> {
    await this.scheincriteriaService.delete(id);
  }

  @Get('/form')
  @UseGuards(new HasRoleGuard(Role.ADMIN))
  async getFormData(): Promise<FormDataResponse> {
    const formData = await this.scheincriteriaService.getFormData();

    return formData;
  }

  @Get('/student')
  @UseGuards(new HasRoleGuard([Role.ADMIN, Role.EMPLOYEE]))
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
