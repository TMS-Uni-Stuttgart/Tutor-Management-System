import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AllowCorrectors } from '../../guards/decorators/allowCorrectors.decorator';
import { AllowSubstitutes } from '../../guards/decorators/allowSubstitutes.decorator';
import { IDField } from '../../guards/decorators/idField.decorator';
import { HasRoleGuard } from '../../guards/has-role.guard';
import { TutorialGuard } from '../../guards/tutorial.guard';
import { PdfService } from './pdf.service';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get('/attendance/:tutorialId/:date')
  @IDField('tutorialId')
  @UseGuards(TutorialGuard)
  @AllowSubstitutes()
  async getAttendancePDF(
    @Param('tutorialId') id: string,
    @Param('date') date: string,
    @Res() res: Response
  ): Promise<void> {
    const buffer = await this.pdfService.generateAttendancePDF(id, date);

    res.contentType('pdf');
    res.send(buffer);
  }

  @Get('/scheinoverview')
  @UseGuards(HasRoleGuard)
  async getScheinstatusPDF(
    @Query('clearMatriculationNos') clearMatriculationNos: string,
    @Res() res: Response
  ): Promise<void> {
    const buffer = await this.pdfService.generateStudentScheinOverviewPDF(
      clearMatriculationNos !== 'true'
    );

    res.contentType('pdf');
    res.send(buffer);
  }

  @Get('/scheinexam/:id/result')
  @UseGuards(HasRoleGuard)
  async getScheinexamResultPDF(
    @Param('id') id: string,
    @Query('clearMatriculationNos') clearMatriculationNos: string,
    @Res() res: Response
  ): Promise<void> {
    const buffer = await this.pdfService.generateScheinexamResultPDF(
      id,
      clearMatriculationNos !== 'true'
    );

    res.contentType('pdf');
    res.send(buffer);
  }

  @Get('/credentials')
  @UseGuards(HasRoleGuard)
  async getCredentialsPDF(@Res() res: Response): Promise<void> {
    const buffer = await this.pdfService.generateCredentialsPDF();

    res.contentType('pdf');
    res.send(buffer);
  }

  @Get('/grading/tutorial/:tutorialId/sheet/:sheetId')
  @UseGuards(TutorialGuard)
  @AllowCorrectors()
  @IDField('tutorialId')
  async getCorrectionZIP(
    @Param('tutorialId') tutorialId: string,
    @Param('sheetId') sheetId: string,
    @Res() res: Response
  ): Promise<void> {
    const zipStream = await this.pdfService.generateTutorialGradingZIP({ tutorialId, sheetId });

    res.contentType('zip');
    zipStream.pipe(res);
  }

  @Get('/grading/tutorial/:tutorialId/sheet/:sheetId/team/:teamId')
  @UseGuards(TutorialGuard)
  @AllowCorrectors()
  @IDField('tutorialId')
  async getCorrectionPDFForTeam(
    @Param('tutorialId') tutorialId: string,
    @Param('sheetId') sheetId: string,
    @Param('teamId') teamId: string,
    @Res() res: Response
  ): Promise<void> {
    const pdfData: Buffer | NodeJS.ReadableStream = await this.pdfService.generateGradingPDF({
      teamId: { tutorialId, teamId },
      sheetId,
    });

    if (pdfData instanceof Buffer) {
      res.contentType('pdf');
      res.send(pdfData);
    } else {
      res.contentType('zip');
      pdfData.pipe(res);
    }
  }

  @Get('/grading/filename/tutorial/:tutorialId/sheet/:sheetId')
  @UseGuards(TutorialGuard)
  @AllowCorrectors()
  @IDField('tutorialId')
  async getCorrectionZIPFilename(
    @Param('tutorialId') tutorialId: string,
    @Param('sheetId') sheetId: string
  ): Promise<string> {
    return this.pdfService.generateTutorialGradingFilename({ sheetId, tutorialId });
  }

  @Get('/grading/filename/tutorial/:tutorialId/sheet/:sheetId/team/:teamId')
  @UseGuards(TutorialGuard)
  @AllowCorrectors()
  @IDField('tutorialId')
  async getCorrectionFilenameForTeam(
    @Param('tutorialId') tutorialId: string,
    @Param('sheetId') sheetId: string,
    @Param('teamId') teamId: string
  ): Promise<string> {
    return this.pdfService.generateGradingFilename({ sheetId, teamId: { teamId, tutorialId } });
  }
}
