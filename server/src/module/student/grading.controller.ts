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
import { plainToClass } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';
import { GradingResponseData, IGradingDTO } from 'shared/model/Gradings';
import { Role } from 'shared/model/Role';
import { Student } from '../../database/entities/student.entity';
import { AllowCorrectors } from '../../guards/decorators/allowCorrectors.decorator';
import { IDField } from '../../guards/decorators/idField.decorator';
import { Roles } from '../../guards/decorators/roles.decorator';
import { HasRoleGuard } from '../../guards/has-role.guard';
import { StudentGuard } from '../../guards/student.guard';
import { TeamGuard } from '../../guards/team.guard';
import { TutorialGuard } from '../../guards/tutorial.guard';
import { TeamService } from '../team/team.service';
import { GradingService } from './grading.service';
import { GradingDTO } from './student.dto';
import { StudentService } from './student.service';

@Controller('grading')
export class GradingController {
    constructor(
        private readonly gradingService: GradingService,
        private readonly studentService: StudentService,
        private readonly teamService: TeamService
    ) {}

    @Get('/handIn/:handInId')
    @UseGuards(HasRoleGuard)
    @Roles(Role.ADMIN, Role.EMPLOYEE)
    async getAllGradingsOfHandIn(
        @Param('handInId') handInId: string
    ): Promise<GradingResponseData[]> {
        return this.gradingService.findOfHandIn(handInId);
    }

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
    @IDField('tutorialId')
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

        const studentIds = dtos.map(([studentId]) => studentId);
        const students = await this.studentService.findMany(studentIds);

        const studentMap = new Map(students.map((student) => [student.id, student]));

        for (const [studentId, dtoData] of dtos) {
            const dto = plainToClass(GradingDTO, dtoData);
            const errors = validateSync(dto);

            if (errors.length === 0) {
                const student = studentMap.get(studentId);
                if (student) {
                    dtoMap.set(student, dto);
                } else {
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

        await this.gradingService.setOfTeam(team, dto);
    }
}
