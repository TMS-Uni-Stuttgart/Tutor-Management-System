import { Controller, Get, Res, Param, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ExcelService } from './excel.service';
import { TutorialGuard } from '../../guards/tutorial.guard';

@Controller('excel')
export class ExcelController {
  constructor(private readonly excelService: ExcelService) {}

  @Get('/tutorial/:id')
  @UseGuards(TutorialGuard)
  async getTutorialXLSX(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const buffer = await this.excelService.generateTutorialBackup(id);

    res.contentType('xlsx');
    res.send(buffer);
  }
}
