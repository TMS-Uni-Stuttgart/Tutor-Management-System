import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { Roles } from '../../guards/decorators/roles.decorator';
import { HasRoleGuard } from '../../guards/has-role.guard';
import { StudentGuard } from '../../guards/student.guard';
import { TutorialGuard } from '../../guards/tutorial.guard';
import { FormDataResponse } from 'shared/model/FormTypes';
import { Role } from 'shared/model/Role';
import {
    CriteriaInformation,
    IScheinCriteria,
    ScheinCriteriaSummary,
    ScheincriteriaSummaryByStudents,
} from 'shared/model/ScheinCriteria';
import { ScheinCriteriaDTO } from './scheincriteria.dto';
import { ScheincriteriaService } from './scheincriteria.service';

@Controller('scheincriteria')
export class ScheincriteriaController {
    constructor(private readonly scheincriteriaService: ScheincriteriaService) {}

    @Get()
    @UseGuards(HasRoleGuard)
    @Roles(Role.ADMIN, Role.EMPLOYEE)
    async getAllCriterias(): Promise<IScheinCriteria[]> {
        const scheincriterias = await this.scheincriteriaService.findAll();

        return scheincriterias.map((criteria) => criteria.toDTO());
    }

    @Post()
    @UseGuards(HasRoleGuard)
    @Roles(Role.ADMIN, Role.EMPLOYEE)
    @UsePipes(ValidationPipe)
    async createCriteria(@Body() dto: ScheinCriteriaDTO): Promise<IScheinCriteria> {
        return await this.scheincriteriaService.create(dto);
    }

    @Patch('/:id')
    @UseGuards(HasRoleGuard)
    @Roles(Role.ADMIN, Role.EMPLOYEE)
    @UsePipes(ValidationPipe)
    async updateCriteria(
        @Param('id') id: string,
        @Body() dto: ScheinCriteriaDTO
    ): Promise<IScheinCriteria> {
        return await this.scheincriteriaService.update(id, dto);
    }

    @Delete('/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(HasRoleGuard)
    @Roles(Role.ADMIN, Role.EMPLOYEE)
    async deleteCriteria(@Param('id') id: string): Promise<void> {
        await this.scheincriteriaService.delete(id);
    }

    @Get('/:id/info')
    @UseGuards(HasRoleGuard)
    async getInformation(@Param('id') id: string): Promise<CriteriaInformation> {
        return await this.scheincriteriaService.getInfoAboutCriteria(id);
    }

    @Get('/form')
    @UseGuards(HasRoleGuard)
    @Roles(Role.ADMIN, Role.EMPLOYEE)
    async getFormData(): Promise<FormDataResponse> {
        return await this.scheincriteriaService.getFormData();
    }

    @Get('/student')
    @UseGuards(HasRoleGuard)
    @Roles(Role.ADMIN, Role.EMPLOYEE)
    async getResultsOfAllStudents(): Promise<ScheincriteriaSummaryByStudents> {
        return await this.scheincriteriaService.getResultsOfAllStudents();
    }

    @Get('/student/:id')
    @UseGuards(StudentGuard)
    async getResultOfStudent(@Param('id') id: string): Promise<ScheinCriteriaSummary> {
        return await this.scheincriteriaService.getResultOfStudent(id);
    }

    @Get('/tutorial/:id')
    @UseGuards(TutorialGuard)
    async getResultsOfTutorial(@Param('id') id: string): Promise<ScheincriteriaSummaryByStudents> {
        return await this.scheincriteriaService.getResultsOfTutorial(id);
    }
}
