import { Module } from '@nestjs/common';
import { ScheinexamModule } from '../scheinexam/scheinexam.module';
import { SheetModule } from '../sheet/sheet.module';
import { ShortTestModule } from '../short-test/short-test.module';
import { StudentModule } from '../student/student.module';
import { TeamModule } from '../team/team.module';
import { TutorialModule } from '../tutorial/tutorial.module';
import { MarkdownController } from './markdown.controller';
import { MarkdownService } from './markdown.service';

@Module({
  imports: [
    StudentModule,
    TeamModule,
    TutorialModule,
    SheetModule,
    ScheinexamModule,
    ShortTestModule,
  ],
  providers: [MarkdownService],
  controllers: [MarkdownController],
  exports: [MarkdownService],
})
export class MarkdownModule {}
