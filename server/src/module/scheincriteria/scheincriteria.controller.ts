import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { ScheinCriteriaResponse } from '../../shared/model/ScheinCriteria';
import { ScheinCriteriaDTO } from './scheincriteria.dto';
import { ScheincriteriaService } from './scheincriteria.service';
import { HasRoleGuard } from '../../guards/has-role.guard';
import { Role } from '../../shared/model/Role';
import { FormDataResponse } from '../../shared/model/FormTypes';

@Controller('scheincriteria')
export class ScheincriteriaController {
  constructor(private readonly scheincriteriaService: ScheincriteriaService) {}

  @Get()
  @UseGuards(new HasRoleGuard([Role.ADMIN, Role.EMPLOYEE]))
  async getAllCriterias(): Promise<ScheinCriteriaResponse[]> {
    const scheincriterias = await this.scheincriteriaService.findAll();

    return scheincriterias;
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
}
