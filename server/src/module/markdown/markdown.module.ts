import { Module } from '@nestjs/common';
import { MarkdownService } from './markdown.service';
import { MarkdownController } from './markdown.controller';
import { TeamModule } from '../team/team.module';
import { SheetModule } from '../sheet/sheet.module';
import { StudentModule } from '../student/student.module';

@Module({
  imports: [StudentModule, TeamModule, SheetModule],
  providers: [MarkdownService],
  exports: [MarkdownService],
  controllers: [MarkdownController],
})
export class MarkdownModule {}
