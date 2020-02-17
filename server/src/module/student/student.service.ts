import { Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { ServiceInterface } from '../../helpers/ServiceInterface';
import { Student, StudentDTO } from '../../shared/model/Student';
import { StudentDocument, StudentModel } from '../models/student.model';

@Injectable()
export class StudentService implements ServiceInterface<Student, StudentDTO, StudentDocument> {
  constructor(
    @InjectModel(StudentModel) private readonly studentModel: ReturnModelType<typeof StudentModel>
  ) {}

  /**
   * @returns All students saved in the database.
   */
  async findAll(): Promise<Student[]> {
    const allStudents = await this.studentModel.find().exec();

    return allStudents.map(student => student.toDTO());
  }

  async findById(id: string): Promise<StudentDocument> {
    throw new Error('Method not implemented.');
  }

  async create(dto: StudentDTO): Promise<Student> {
    throw new Error('Method not implemented.');
  }
}
