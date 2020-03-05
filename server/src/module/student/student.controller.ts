import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Get,
  UseGuards,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { IStudent } from '../../shared/model/Student';
import {
  StudentDTO,
  CakeCountDTO,
  AttendanceDTO,
  PresentationPointsDTO,
  GradingDTO,
} from './student.dto';
import { StudentService } from './student.service';
import { Role } from '../../shared/model/Role';
import { HasRoleGuard } from '../../guards/has-role.guard';
import { StudentGuard } from '../../guards/student.guard';
import { IAttendance } from '../../shared/model/Attendance';

@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  @UseGuards(new HasRoleGuard([Role.ADMIN, Role.EMPLOYEE]))
  async getAllStudents(): Promise<IStudent[]> {
    const students = await this.studentService.findAll();

    return students.map(user => user.toDTO());
  }

  @Post()
  @UseGuards(new HasRoleGuard([Role.ADMIN, Role.TUTOR]))
  @UsePipes(ValidationPipe)
  async createStudent(@Body() dto: StudentDTO): Promise<IStudent> {
    // TODO: Guard -- Check if the student is created IN the tutorial of the calling tutor.
    const student = await this.studentService.create(dto);

    return student;
  }

  @Get('/:id')
  @UseGuards(StudentGuard)
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
  @UsePipes(ValidationPipe)
  async updatePoints(@Param('id') id: string, @Body() dto: GradingDTO): Promise<void> {
    await this.studentService.setGrading(id, dto);
  }

  @Put('/:id/cakecount')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(StudentGuard)
  @UsePipes(ValidationPipe)
  async updateCakeCount(@Param('id') id: string, @Body() dto: CakeCountDTO): Promise<void> {
    await this.studentService.setCakeCount(id, dto);
  }
}
