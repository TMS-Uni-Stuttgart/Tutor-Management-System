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
} from '@nestjs/common';
import { ScheinCriteriaResponse } from '../../shared/model/ScheinCriteria';
import { ScheinCriteriaDTO } from './scheincriteria.dto';
import { ScheincriteriaService } from './scheincriteria.service';

@Controller('scheincriteria')
export class ScheincriteriaController {
  constructor(private readonly scheincriteriaService: ScheincriteriaService) {}

  // TODO: Add guards to ALL routes!
  @Get()
  async getAllCriterias(): Promise<ScheinCriteriaResponse[]> {
    const scheincriterias = await this.scheincriteriaService.findAll();

    return scheincriterias;
  }

  @Post()
  @UsePipes(ValidationPipe)
  async createCriteria(@Body() dto: ScheinCriteriaDTO): Promise<ScheinCriteriaResponse> {
    const scheincriteria = await this.scheincriteriaService.create(dto);

    return scheincriteria;
  }

  @Get('/:id')
  async getCriteria(@Param('id') id: string): Promise<ScheinCriteriaResponse> {
    const scheincriteria = await this.scheincriteriaService.findById(id);

    return scheincriteria.toDTO();
  }

  @Patch('/:id')
  @UsePipes(ValidationPipe)
  async updateCriteria(
    @Param('id') id: string,
    @Body() dto: ScheinCriteriaDTO
  ): Promise<ScheinCriteriaResponse> {
    const scheincritera = await this.scheincriteriaService.update(id, dto);

    return scheincritera;
  }

  @Delete('/:id')
  async deleteCriteria(@Param('id') id: string): Promise<void> {
    await this.scheincriteriaService.delete(id);
  }
}
