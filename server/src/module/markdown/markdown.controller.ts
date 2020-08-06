import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AllowCorrectors } from '../../guards/decorators/allowCorrectors.decorator';
import { IDField } from '../../guards/decorators/idField.decorator';
import { StudentGuard } from '../../guards/student.guard';
import { TutorialGuard } from '../../guards/tutorial.guard';
import { ITeamMarkdownData } from '../../shared/model/Markdown';
import { MarkdownService } from './markdown.service';

@Controller('markdown')
export class MarkdownController {
  constructor(private readonly markdownService: MarkdownService) {}

  @Get('/grading/:sheetId/tutorial/:tutorialId/team/:teamId')
  @UseGuards(TutorialGuard)
  @AllowCorrectors()
  @IDField('tutorialId')
  async getMarkdown(
    @Param('sheetId') sheetId: string,
    @Param('tutorialId') tutorialId: string,
    @Param('teamId') teamId: string
  ): Promise<ITeamMarkdownData[]> {
    const gradings = await this.markdownService.getTeamGrading({
      teamId: { tutorialId, teamId },
      sheetId,
    });

    return gradings.markdownData;
  }

  @Get('/grading/:sheetId/student/:studentId')
  @UseGuards(StudentGuard)
  @AllowCorrectors()
  @IDField('studentId')
  async getMarkdownForStudentGrading(
    @Param('sheetId') sheetId: string,
    @Param('studentId') studentId: string
  ): Promise<string> {
    const markdown = await this.markdownService.getStudentGrading(studentId, sheetId);

    return markdown;
  }
}
