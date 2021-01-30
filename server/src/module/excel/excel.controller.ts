import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Res,
    UseGuards,
    UsePipes,
    ValidationPipe,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AllowCorrectors } from '../../guards/decorators/allowCorrectors.decorator';
import { HasRoleGuard } from '../../guards/has-role.guard';
import { TutorialGuard } from '../../guards/tutorial.guard';
import { ParseCsvResult } from '../../shared/model/CSV';
import { ParseCsvDTO } from './excel.dto';
import { ExcelService } from './excel.service';

@Controller('excel')
export class ExcelController {
    constructor(private readonly excelService: ExcelService) {}

    @Get('/tutorial/:id')
    @UseGuards(TutorialGuard)
    @AllowCorrectors()
    async getTutorialXLSX(@Param('id') id: string, @Res() res: Response): Promise<void> {
        const buffer = await this.excelService.generateTutorialBackup(id);

        res.contentType('xlsx');
        res.send(buffer);
    }

    @Post('/parseCSV')
    @HttpCode(HttpStatus.OK)
    @UseGuards(HasRoleGuard)
    @UsePipes(ValidationPipe)
    async parseCSV(@Body() body: ParseCsvDTO): Promise<ParseCsvResult<unknown>> {
        return await this.excelService.parseCSV(body);
    }
}
