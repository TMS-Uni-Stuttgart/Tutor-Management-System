import { Body, Controller, Post, UsePipes, ValidationPipe, Get } from '@nestjs/common';
import { Student } from '../../shared/model/Student';
import { StudentDTO } from './student.dto';
import { StudentService } from './student.service';

@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  async getAllStudents(): Promise<Student[]> {
    const students = await this.studentService.findAll();

    return students;
  }

  @Post()
  @UsePipes(ValidationPipe)
  async createStudent(@Body() dto: StudentDTO): Promise<Student> {
    // TODO: Authentication & other guards
    const student = await this.studentService.create(dto);

    return student;
  }
}
