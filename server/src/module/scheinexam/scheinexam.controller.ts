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
import { AuthenticatedGuard } from '../../guards/authenticated.guard';
import { HasRoleGuard } from '../../guards/has-role.guard';
import { IScheinExam } from '../../shared/model/Scheinexam';
import { ScheinexamDTO } from './scheinexam.dto';
import { ScheinexamService } from './scheinexam.service';

@Controller('scheinexam')
export class ScheinexamController {
  constructor(private readonly scheinexamService: ScheinexamService) {}

  @Get()
  @UseGuards(AuthenticatedGuard)
  async getAllScheinexams(): Promise<IScheinExam[]> {
    const scheinexams = await this.scheinexamService.findAll();

    return scheinexams.map((exam) => exam.toDTO());
  }

  @Post()
  @UseGuards(HasRoleGuard)
  @UsePipes(ValidationPipe)
  async createScheinexam(@Body() dto: ScheinexamDTO): Promise<IScheinExam> {
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
  @UseGuards(HasRoleGuard)
  @UsePipes(ValidationPipe)
  async updateScheinexam(
    @Param('id') id: string,
    @Body() dto: ScheinexamDTO
  ): Promise<IScheinExam> {
    const scheinexam = await this.scheinexamService.update(id, dto);

    return scheinexam;
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(HasRoleGuard)
  async deleteScheinexam(@Param('id') id: string): Promise<void> {
    await this.scheinexamService.delete(id);
  }
}
