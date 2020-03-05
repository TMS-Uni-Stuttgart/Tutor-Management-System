import {
  Controller,
  Get,
  UseGuards,
  Body,
  Post,
  UsePipes,
  ValidationPipe,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ScheinexamService } from './scheinexam.service';
import { AuthenticatedGuard } from '../../guards/authenticated.guard';
import { IScheinExam } from '../../shared/model/Scheinexam';
import { ScheinExamDTO } from './scheinexam.dto';
import { HasRoleGuard } from '../../guards/has-role.guard';
import { Role } from '../../shared/model/Role';

@Controller('scheinexam')
export class ScheinexamController {
  constructor(private readonly scheinexamService: ScheinexamService) {}

  @Get()
  @UseGuards(AuthenticatedGuard)
  async getAllScheinexams(): Promise<IScheinExam[]> {
    const scheinexams = await this.scheinexamService.findAll();

    return scheinexams.map(exam => exam.toDTO());
  }

  @Post()
  @UseGuards(new HasRoleGuard(Role.ADMIN))
  @UsePipes(ValidationPipe)
  async createScheinexam(@Body() dto: ScheinExamDTO): Promise<IScheinExam> {
    const scheinexam = await this.scheinexamService.create(dto);

    return scheinexam;
  }

  @Get('/:id')
  @UseGuards(AuthenticatedGuard)
  async getScheinexam(@Param('id') id: string): Promise<IScheinExam> {
    const scheinexam = await this.scheinexamService.findById(id);

    return scheinexam.toDTO();
  }

  @Patch('/:id')
  @UseGuards(new HasRoleGuard(Role.ADMIN))
  @UsePipes(ValidationPipe)
  async updateScheinexam(
    @Param('id') id: string,
    @Body() dto: ScheinExamDTO
  ): Promise<IScheinExam> {
    const scheinexam = await this.scheinexamService.update(id, dto);

    return scheinexam;
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(new HasRoleGuard(Role.ADMIN))
  async deleteScheinexam(@Param('id') id: string): Promise<void> {
    await this.scheinexamService.delete(id);
  }
}
