import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Res,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { AllowCorrectors } from '../../guards/decorators/allowCorrectors.decorator';
import { HasRoleGuard } from '../../guards/has-role.guard';
import { TutorialGuard } from '../../guards/tutorial.guard';
import { ParseCsvResult } from 'shared/model/CSV';
import { ParseCsvDTO } from './excel.dto';
import { ExcelService } from './excel.service';
import { Roles } from '../../guards/decorators/roles.decorator';
import { Role } from 'shared/model/Role';

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
    @Roles(Role.ADMIN, Role.EMPLOYEE, Role.TUTOR)
    @UsePipes(ValidationPipe)
    async parseCSV(@Body() body: ParseCsvDTO): Promise<ParseCsvResult<unknown>> {
        return await this.excelService.parseCSV(body);
    }

    @Get('/schein-information')
    @HttpCode(HttpStatus.OK)
    @UseGuards(HasRoleGuard)
    async getScheinStatusCSV(@Res() res: Response): Promise<void> {
        const buffer = await this.excelService.generateScheinstatusTable();

        res.contentType('xlsx');
        res.send(buffer);
    }
}
