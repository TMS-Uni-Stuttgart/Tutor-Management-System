import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { Sheet } from '../../shared/model/Sheet';
import { SheetDTO } from './sheet.dto';
import { SheetService } from './sheet.service';

@Controller('sheet')
export class SheetController {
  constructor(private readonly sheetService: SheetService) {}

  @Get()
  async getAllSheet(): Promise<Sheet[]> {
    const sheets = await this.sheetService.findAll();

    return sheets;
  }

  @Post()
  @UsePipes(ValidationPipe)
  async createSheet(@Body() dto: SheetDTO): Promise<Sheet> {
    const sheet = await this.sheetService.create(dto);

    return sheet;
  }
}
