import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AllowCorrectors } from '../../guards/decorators/allowCorrectors.decorator';
import { TutorialGuard } from '../../guards/tutorial.guard';
import { ExcelService } from './excel.service';

@Controller('excel')
export class ExcelController {
  constructor(private readonly excelService: ExcelService) {}

  @Get('/tutorial/:id')
  @UseGuards(TutorialGuard)
  @AllowCorrectors()
  async getTutorialXLSX(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const buffer = await this.excelService.generateTutorialBackup(id);

    res.contentType('xlsx');
    res.send(buffer);
  }
}
