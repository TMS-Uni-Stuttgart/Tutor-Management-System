import {
  Body,
  Controller,
  Get,
  Post,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Sheet } from '../../shared/model/Sheet';
import { SheetDTO } from './sheet.dto';
import { SheetService } from './sheet.service';
import { AuthenticatedGuard } from '../../guards/authenticated.guard';
import { HasRoleGuard } from '../../guards/has-role.guard';
import { Role } from '../../shared/model/Role';

@Controller('sheet')
export class SheetController {
  constructor(private readonly sheetService: SheetService) {}

  @Get()
  @UseGuards(AuthenticatedGuard)
  async getAllSheet(): Promise<Sheet[]> {
    const sheets = await this.sheetService.findAll();

    return sheets;
  }

  @Post()
  @UseGuards(new HasRoleGuard(Role.ADMIN))
  @UsePipes(ValidationPipe)
  async createSheet(@Body() dto: SheetDTO): Promise<Sheet> {
    const sheet = await this.sheetService.create(dto);

    return sheet;
  }

  @Get('/:id')
  @UseGuards(AuthenticatedGuard)
  async getSheet(@Param('id') id: string): Promise<Sheet> {
    const sheet = await this.sheetService.findById(id);

    return sheet.toDTO();
  }

  @Patch('/:id')
  @UseGuards(new HasRoleGuard(Role.ADMIN))
  @UsePipes(ValidationPipe)
  async updateSheet(@Param('id') id: string, @Body() dto: SheetDTO): Promise<Sheet> {
    const sheet = await this.sheetService.update(id, dto);

    return sheet;
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(new HasRoleGuard(Role.ADMIN))
  async deleteSheet(@Param('id') id: string): Promise<void> {
    await this.sheetService.delete(id);
  }
}
