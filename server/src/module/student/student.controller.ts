import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { DateTime } from 'luxon';
import { CreatedInOwnTutorialGuard } from '../../guards/created-in-own-tutorial.guard';
import { AllowCorrectors } from '../../guards/decorators/allowCorrectors.decorator';
import { AllowSubstitutes } from '../../guards/decorators/allowSubstitutes.decorator';
import { Roles } from '../../guards/decorators/roles.decorator';
import { HasRoleGuard } from '../../guards/has-role.guard';
import { StudentGuard } from '../../guards/student.guard';
import { AttendanceState, IAttendance } from '../../shared/model/Attendance';
import { Role } from '../../shared/model/Role';
import { IStudent } from '../../shared/model/Student';
import { SettingsService } from '../settings/settings.service';
import {
  AttendanceDTO,
  CakeCountDTO,
  GradingDTO,
  PresentationPointsDTO,
  StudentDTO,
} from './student.dto';
import { StudentService } from './student.service';

interface CheckCanExcuseParams {
  dto: AttendanceDTO;
  studentId: string;
  user?: Express.User;
}

@Controller('student')
export class StudentController {
  constructor(
    private readonly studentService: StudentService,
    private readonly settingsService: SettingsService
  ) {}

  @Get()
  @UseGuards(HasRoleGuard)
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  async getAllStudents(): Promise<IStudent[]> {
    const students = await this.studentService.findAll();

    return students.map((user) => user.toDTO());
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
  async deleteStudent(@Param('id') id: string): Promise<void> {
    await this.studentService.delete(id);
  }

  @Put('/:id/attendance')
  @UseGuards(StudentGuard)
  @AllowSubstitutes()
  @UsePipes(ValidationPipe)
  async updateAttendance(
    @Param('id') id: string,
    @Body() dto: AttendanceDTO,
    @Request() request: ExpressRequest
  ): Promise<IAttendance> {
    await this.checkUserCanExcuseOrThrow({ dto, studentId: id, user: request.user });

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

  /**
   * Checks if the given user is allowed to proceed with the request to change the attendance state in regards to the application settings.
   *
   * __Important__: This does __NOT__ check if the user is allowed in general (ie correct role, is tutor, ...). Those checks must still be performed by the corresponding route guard!
   *
   * This checks if all of the following conditions are met. If so an exception is thrown:
   * - The application settings disallow non-admins to excuse a student.
   * - The user making the request is __not__ an admin.
   * - The DTO would change the attendance state of a student to `excused`.
   *
   * @param params Must contain the `studentId`, the `dto` of the request and the `user` making the request (optional).
   *
   * @throws `BadRequestException` - If the given `user` is not defined.
   * @throws `ForbiddenException` - If the `user` is not allowed to proceed with the request (see above).
   */
  private async checkUserCanExcuseOrThrow({
    user,
    dto,
    studentId,
  }: CheckCanExcuseParams): Promise<void> {
    if (!user) {
      throw new BadRequestException('No user available in request.');
    }

    const settings = await this.settingsService.getClientSettings();
    const student = await this.studentService.findById(studentId);
    const wouldChangeAttendance =
      student.getAttendance(DateTime.fromISO(dto.date))?.state !== dto.state;

    if (!wouldChangeAttendance) {
      return;
    }

    if (
      !settings.canTutorExcuseStudents &&
      !user.roles.includes(Role.ADMIN) &&
      dto.state === AttendanceState.EXCUSED
    ) {
      throw new ForbiddenException('User is not allowed to excuse a student.');
    }
  }
}
