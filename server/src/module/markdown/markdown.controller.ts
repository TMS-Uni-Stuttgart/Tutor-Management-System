import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { IDField } from '../../decorators/idField.decorator';
import { TutorialGuard } from '../../guards/tutorial.guard';
import { MarkdownService } from './markdown.service';
import { StudentGuard } from '../../guards/student.guard';

@Controller('markdown')
export class MarkdownController {
  constructor(private readonly markdownService: MarkdownService) {}

  @Get('/grading/:sheetId/tutorial/:tutorialId/team/:teamId')
  @UseGuards(TutorialGuard)
  @IDField('tutorialId')
  async getMarkdown(
    @Param('sheetId') sheetId: string,
    @Param('tutorialId') tutorialId: string,
    @Param('teamId') teamId: string
  ): Promise<string> {
    const markdown = await this.markdownService.getTeamGrading({
      teamId: { tutorialId, teamId },
      sheetId,
    });

    return markdown;
  }

  @Get('/grading/:sheetId/student/:studentId')
  @UseGuards(StudentGuard)
  @IDField('studentId')
  async getMarkdownForStudentGrading(
    @Param('sheetId') sheetId: string,
    @Param('studentId') studentId: string
  ): Promise<string> {
    const markdown = await this.markdownService.getStudentGrading(studentId, sheetId);

    return markdown;
  }
}
