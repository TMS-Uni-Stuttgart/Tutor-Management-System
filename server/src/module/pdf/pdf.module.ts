import { Module } from '@nestjs/common';
import { MarkdownModule } from '../markdown/markdown.module';
import { ScheincriteriaModule } from '../scheincriteria/scheincriteria.module';
import { ScheinexamModule } from '../scheinexam/scheinexam.module';
import { SheetModule } from '../sheet/sheet.module';
import { StudentModule } from '../student/student.module';
import { TeamModule } from '../team/team.module';
import { TemplateModule } from '../template/template.module';
import { TutorialModule } from '../tutorial/tutorial.module';
import { UserModule } from '../user/user.module';
import { FileService } from './file.service';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';
import { AttendancePDFGenerator } from './subservices/PDFGenerator.attendance';
import { CredentialsPDFGenerator } from './subservices/PDFGenerator.credentials';
import { GradingPDFGenerator } from './subservices/PDFGenerator.grading';
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
        TeamModule,
        TutorialModule,
    ],
    providers: [
        PdfService,
        FileService,
        AttendancePDFGenerator,
        CredentialsPDFGenerator,
        ScheinexamResultPDFGenerator,
        ScheinResultsPDFGenerator,
        MarkdownPDFGenerator,
        GradingPDFGenerator,
    ],
    controllers: [PdfController],
})
export class PdfModule {}
