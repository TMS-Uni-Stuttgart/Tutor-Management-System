import { Module } from '@nestjs/common';
import { MarkdownService } from './markdown.service';
import { MarkdownController } from './markdown.controller';
import { TeamModule } from '../team/team.module';
import { SheetModule } from '../sheet/sheet.module';
import { StudentModule } from '../student/student.module';
import { TutorialModule } from '../tutorial/tutorial.module';

@Module({
  imports: [StudentModule, TeamModule, TutorialModule, SheetModule],
  providers: [MarkdownService],
  exports: [MarkdownService],
  controllers: [MarkdownController],
})
export class MarkdownModule {}
