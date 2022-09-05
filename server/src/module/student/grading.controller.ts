import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Put,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { GradingService } from './grading.service';
import { GradingDTO } from './student.dto';
import { StudentService } from './student.service';
import { AllowCorrectors } from '../../guards/decorators/allowCorrectors.decorator';
import { StudentGuard } from '../../guards/student.guard';
import { IDField } from '../../guards/decorators/idField.decorator';
import { GradingResponseData, IGradingDTO } from 'shared/model/Gradings';
import { validateSync, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { Student } from '../../database/entities/student.entity';
import { TeamGuard } from '../../guards/team.guard';
import { TeamService } from '../team/team.service';
import { TutorialGuard } from '../../guards/tutorial.guard';

@Controller('grading')
export class GradingController {
    constructor(
        private readonly gradingService: GradingService,
        private readonly studentService: StudentService,
        private readonly teamService: TeamService
    ) {}

    @Get('/handIn/:handInId/student/:studentId')
    @UseGuards(StudentGuard)
    @AllowCorrectors()
    @IDField('studentId')
    async getGradingOfSingleStudent(
        @Param('handInId') handInId: string,
        @Param('studentId') studentId: string
    ): Promise<GradingResponseData> {
        const grading = await this.gradingService.findOfStudentAndHandIn(studentId, handInId);

        return { gradingData: grading?.toDTO(), studentId: studentId };
    }

    @Get('/handIn/:handInId/tutorial/:tutorialId')
    @UseGuards(TutorialGuard)
    @AllowCorrectors()
    @IDField('studentId')
    async getGradingsOfTutorial(
        @Param('handInId') handInId: string,
        @Param('tutorialId') tutorialId: string
    ): Promise<GradingResponseData[]> {
        return this.gradingService.findOfTutorialAndHandIn(tutorialId, handInId);
    }

    @Put('/student/:studentId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(StudentGuard)
    @AllowCorrectors()
    @IDField('studentId')
    @UsePipes(ValidationPipe)
    async updateSingleGrading(
        @Param('studentId') studentId: string,
        @Body() dto: GradingDTO
    ): Promise<void> {
        await this.gradingService.setOfStudent(await this.studentService.findById(studentId), dto);
    }

    @Put('/multiple')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(StudentGuard)
    @AllowCorrectors()
    @UsePipes(ValidationPipe)
    async updateOfMultipleStudents(@Body() dtos: [string, IGradingDTO][]): Promise<void> {
        const dtoMap = new Map<Student, GradingDTO>();
        const notValidDTO: { studentId: string; errors: ValidationError[] | string }[] = [];

        for (const [studentId, dtoData] of dtos) {
            const dto = plainToClass(GradingDTO, dtoData);
            const errors = validateSync(dto);

            if (errors.length === 0) {
                try {
                    const student = await this.studentService.findById(studentId);
                    dtoMap.set(student, dto);
                } catch (e) {
                    notValidDTO.push({
                        studentId,
                        errors: `Could not find the student with the ID '${studentId}'.`,
                    });
                }
            } else {
                notValidDTO.push({ studentId, errors });
            }
        }

        if (notValidDTO.length > 0) {
            throw new BadRequestException(notValidDTO, 'Some DTOs are not valid.');
        }

        await this.gradingService.setOfMultipleStudents(dtoMap);
    }

    @Put('/tutorial/:id/team/:teamId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(TeamGuard)
    @AllowCorrectors()
    @UsePipes(ValidationPipe)
    async updateTeamGrading(
        @Param('id') tutorialId: string,
        @Param('teamId') teamId: string,
        @Body() dto: GradingDTO
    ): Promise<void> {
        const team = await this.teamService.findById({ tutorialId, teamId });
        const dtoMap = new Map<Student, GradingDTO>();

        for (const student of team.students) {
            dtoMap.set(student, dto);
        }

        await this.gradingService.setOfMultipleStudents(dtoMap);
    }
}
