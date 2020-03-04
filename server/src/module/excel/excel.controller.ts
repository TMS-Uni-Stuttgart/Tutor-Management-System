import { Controller, Get, Res, Param } from '@nestjs/common';
import { Response } from 'express';
import { ExcelService } from './excel.service';

@Controller('excel')
export class ExcelController {
  constructor(private readonly excelService: ExcelService) {}

  @Get('/tutorial/:id')
  // TODO: GUARD
  async getTutorialXLSX(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const buffer = await this.excelService.generateTutorialBackup(id);

    res.contentType('xlsx');
    res.send(buffer);
  }
}
