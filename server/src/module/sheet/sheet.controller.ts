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
import { ISheet } from '../../shared/model/Sheet';
import { SheetDTO } from './sheet.dto';
import { SheetService } from './sheet.service';

@Controller('sheet')
export class SheetController {
  constructor(private readonly sheetService: SheetService) {}

  @Get()
  @UseGuards(AuthenticatedGuard)
  async getAllSheets(): Promise<ISheet[]> {
    const sheets = await this.sheetService.findAll();

    return sheets.map(sheet => sheet.toDTO());
  }

  @Post()
  @UseGuards(HasRoleGuard)
  @UsePipes(ValidationPipe)
  async createSheet(@Body() dto: SheetDTO): Promise<ISheet> {
    const sheet = await this.sheetService.create(dto);

    return sheet;
  }

  @Get('/:id')
  @UseGuards(AuthenticatedGuard)
  async getSheet(@Param('id') id: string): Promise<ISheet> {
    const sheet = await this.sheetService.findById(id);

    return sheet.toDTO();
  }

  @Patch('/:id')
  @UseGuards(HasRoleGuard)
  @UsePipes(ValidationPipe)
  async updateSheet(@Param('id') id: string, @Body() dto: SheetDTO): Promise<ISheet> {
    const sheet = await this.sheetService.update(id, dto);

    return sheet;
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(HasRoleGuard)
  async deleteSheet(@Param('id') id: string): Promise<void> {
    await this.sheetService.delete(id);
  }
}
