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
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AllowCorrectors } from '../../guards/decorators/allowCorrectors.decorator';
import { AllowSubstitutes } from '../../guards/decorators/allowSubstitutes.decorator';
import { Roles } from '../../guards/decorators/roles.decorator';
import { HasRoleGuard } from '../../guards/has-role.guard';
import { StudentGuard } from '../../guards/student.guard';
import { IAttendance } from '../../shared/model/Attendance';
import { Role } from '../../shared/model/Role';
import { IStudent } from '../../shared/model/Student';
import {
  AttendanceDTO,
  CakeCountDTO,
  GradingDTO,
  PresentationPointsDTO,
  StudentDTO,
} from './student.dto';
import { StudentService } from './student.service';
import { CreatedInOwnTutorialGuard } from '../../guards/created-in-own-tutorial.guard';

@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  @UseGuards(HasRoleGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  async getAllStudents(): Promise<IStudent[]> {
    const students = await this.studentService.findAll();

    return students.map(user => user.toDTO());
  }

  @Post()
  @UseGuards(HasRoleGuard, CreatedInOwnTutorialGuard)
  @Roles(Role.ADMIN, Role.TUTOR)
  @UsePipes(ValidationPipe)
  async createStudent(@Body() dto: StudentDTO): Promise<IStudent> {
    const student = await this.studentService.create(dto);

    return student;
  }

  @Get('/:id')
  @UseGuards(StudentGuard)
  @AllowSubstitutes()
  @AllowCorrectors()
  async getStudent(@Param('id') id: string): Promise<IStudent> {
    const student = await this.studentService.findById(id);

    return student.toDTO();
  }

  @Patch('/:id')
  @UseGuards(StudentGuard)
  @UsePipes(ValidationPipe)
  async updateStudent(@Param('id') id: string, @Body() dto: StudentDTO): Promise<IStudent> {
    const student = await this.studentService.update(id, dto);

    return student;
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(StudentGuard)
  async deleteStudent(@Param('id') id: string) {
    await this.studentService.delete(id);
  }

  @Put('/:id/attendance')
  @UseGuards(StudentGuard)
  @AllowSubstitutes()
  @UsePipes(ValidationPipe)
  async updateAttendance(
    @Param('id') id: string,
    @Body() dto: AttendanceDTO
  ): Promise<IAttendance> {
    const attendance = await this.studentService.setAttendance(id, dto);

    return attendance;
  }

  @Put('/:id/presentation')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(StudentGuard)
  @AllowSubstitutes()
  @UsePipes(ValidationPipe)
  async updatePresentationPoint(
    @Param('id') id: string,
    @Body() dto: PresentationPointsDTO
  ): Promise<void> {
    await this.studentService.setPresentationPoints(id, dto);
  }

  @Put('/:id/grading')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(StudentGuard)
  @AllowCorrectors()
  @UsePipes(ValidationPipe)
  async updatePoints(@Param('id') id: string, @Body() dto: GradingDTO): Promise<void> {
    await this.studentService.setGrading(id, dto);
  }

  @Put('/:id/cakecount')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(StudentGuard)
  @AllowSubstitutes()
  @UsePipes(ValidationPipe)
  async updateCakeCount(@Param('id') id: string, @Body() dto: CakeCountDTO): Promise<void> {
    await this.studentService.setCakeCount(id, dto);
  }
}
