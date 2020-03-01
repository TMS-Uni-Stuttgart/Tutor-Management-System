import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { IDField } from '../../decorators/idField.decorator';
import { PdfService } from './pdf.service';
import { Response } from 'express';
import { TutorialGuard } from '../../guards/tutorial.guard';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get('/attendance/:tutorialId/:date')
  @IDField('tutorialId')
  @UseGuards(TutorialGuard)
  async getAttendancePDF(
    @Param('tutorialId') id: string,
    @Param('date') date: string,
    @Res() res: Response
  ): Promise<void> {
    const buffer = await this.pdfService.generateAttendancePDF(id, date);

    res.contentType('pdf');
    res.send(buffer);
  }
}
