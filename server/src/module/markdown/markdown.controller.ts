import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthenticatedGuard } from '../../guards/authenticated.guard';
import { AllowCorrectors } from '../../guards/decorators/allowCorrectors.decorator';
import { IDField } from '../../guards/decorators/idField.decorator';
import { StudentGuard } from '../../guards/student.guard';
import { TutorialGuard } from '../../guards/tutorial.guard';
import {
  IMarkdownHTML,
  IStudentMarkdownData,
  ITeamMarkdownData,
} from '../../shared/model/Markdown';
import { MarkdownService } from './markdown.service';
import { MarkdownHTMLDTO } from './markdown.types';

@Controller('markdown')
export class MarkdownController {
  constructor(private readonly markdownService: MarkdownService) {}

  @Post('/html')
  @UseGuards(AuthenticatedGuard)
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.OK)
  getHTMLFromMarkdown(@Body() body: MarkdownHTMLDTO): IMarkdownHTML {
    return this.markdownService.generateHTMLFromMarkdown(body.markdown);
  }

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

  @Get('/grading/:entityId/student/:studentId')
  @UseGuards(StudentGuard)
  @AllowCorrectors()
  @IDField('studentId')
  async getMarkdownForStudentGrading(
    @Param('entityId') entityId: string,
    @Param('studentId') studentId: string
  ): Promise<IStudentMarkdownData> {
    return await this.markdownService.getStudentGrading(studentId, entityId);
  }
}
