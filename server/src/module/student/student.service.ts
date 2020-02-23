import { Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { ServiceInterface } from '../../helpers/ServiceInterface';
import { Student } from '../../shared/model/Student';
import { StudentDocument, StudentModel } from '../../database/models/student.model';
import { StudentDTO } from './student.dto';
import { TutorialService } from '../tutorial/tutorial.service';

@Injectable()
export class StudentService implements ServiceInterface<Student, StudentDTO, StudentDocument> {
  constructor(
    private readonly tutorialService: TutorialService,
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

  /**
   * Creates a student from the given DTO and returns the created student.
   *
   * @param dto DTO with the information for the student to create.
   *
   * @returns Created student.
   *
   * @throws `NotFoundException` - If the tutorial of the student could not be found.
   */
  async create(dto: StudentDTO): Promise<Student> {
    const { tutorial: tutorialId, team, ...rest } = dto;
    const tutorial = await this.tutorialService.findById(tutorialId);

    // TODO: Add proper team.
    const doc = new StudentModel({
      ...rest,
      tutorial,
      team: undefined,
      cakeCount: 0,
      attendances: new Map(),
      gradings: new Map(),
    });
    const created: StudentDocument = await this.studentModel.create(doc);

    return created.toDTO();
  }

  async update(id: string, dto: StudentDTO): Promise<Student> {
    throw new Error('Method not implemented.');
  }

  async delete(id: string): Promise<StudentDocument> {
    throw new Error('Method not implemented.');
  }
}
