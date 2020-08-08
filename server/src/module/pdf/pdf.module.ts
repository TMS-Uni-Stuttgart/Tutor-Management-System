import { Module } from '@nestjs/common';
import { MarkdownModule } from '../markdown/markdown.module';
import { ScheincriteriaModule } from '../scheincriteria/scheincriteria.module';
import { ScheinexamModule } from '../scheinexam/scheinexam.module';
import { SheetModule } from '../sheet/sheet.module';
import { StudentModule } from '../student/student.module';
import { TemplateModule } from '../template/template.module';
import { TutorialModule } from '../tutorial/tutorial.module';
import { UserModule } from '../user/user.module';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';
import { AttendancePDFGenerator } from './subservices/PDFGenerator.attendance';
import { CredentialsPDFGenerator } from './subservices/PDFGenerator.credentials';
import { MarkdownPDFGenerator } from './subservices/PDFGenerator.markdown';
import { ScheinResultsPDFGenerator } from './subservices/PDFGenerator.schein';
import { ScheinexamResultPDFGenerator } from './subservices/PDFGenerator.scheinexam';

@Module({
  imports: [
    TutorialModule,
    UserModule,
    StudentModule,
    ScheincriteriaModule,
    ScheinexamModule,
    MarkdownModule,
    TemplateModule,
    SheetModule,
  ],
  providers: [
    PdfService,
    AttendancePDFGenerator,
    CredentialsPDFGenerator,
    ScheinexamResultPDFGenerator,
    ScheinResultsPDFGenerator,
    MarkdownPDFGenerator,
  ],
  controllers: [PdfController],
})
export class PdfModule {}
