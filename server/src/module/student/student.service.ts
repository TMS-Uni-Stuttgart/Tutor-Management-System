import { Injectable, NotFoundException } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { CRUDService } from '../../helpers/CRUDService';
import { Student } from '../../shared/model/Student';
import { StudentDocument, StudentModel } from '../../database/models/student.model';
import { StudentDTO } from './student.dto';
import { TutorialService } from '../tutorial/tutorial.service';

@Injectable()
export class StudentService implements CRUDService<Student, StudentDTO, StudentDocument> {
  constructor(
    private readonly tutorialService: TutorialService,
    @InjectModel(StudentModel) private readonly studentModel: ReturnModelType<typeof StudentModel>
  ) {}

  /**
   * @returns All students saved in the database.
   */
  async findAll(): Promise<Student[]> {
    const allStudents = (await this.studentModel.find().exec()) as StudentDocument[];

    return allStudents.map(student => student.toDTO());
  }

  /**
   * Searches for a student with the given ID and returns it.
   *
   * @param id ID to search for.
   *
   * @returns StudentDocument with the given ID.
   *
   * @throws `NotFoundException` - If no student with the given ID could be found.
   */
  async findById(id: string): Promise<StudentDocument> {
    const student = (await this.studentModel.findById(id).exec()) as StudentDocument | null;

    if (!student) {
      throw new NotFoundException(`Student with the ID ${id} could not be found`);
    }

    return student;
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
    });
    const created: StudentDocument = (await this.studentModel.create(doc)) as StudentDocument;

    return created.toDTO();
  }

  /**
   * Updates the student with the given ID and the given information.
   *
   * @param id ID of the student to update.
   * @param dto Information to update the student with.
   *
   * @returns Updated student.
   *
   * @throws `NotFoundException` - If the no student with the given ID or if the new tutorial of the student (if it changes) could not be found.
   */
  async update(id: string, dto: StudentDTO): Promise<Student> {
    const student = await this.findById(id);

    if (dto.tutorial !== student.tutorial.id) {
      const tutorial = await this.tutorialService.findById(dto.tutorial);
      student.tutorial = tutorial;
    }

    const { firstname, lastname, status, courseOfStudies, email, matriculationNo } = dto;

    // TODO: Add proper team
    student.firstname = firstname;
    student.lastname = lastname;
    student.status = status;
    student.courseOfStudies = courseOfStudies;
    student.email = email;
    student.matriculationNo = matriculationNo;

    const updatedStudent = await student.save();

    return updatedStudent.toDTO();
  }

  /**
   * Deletes the student with the given ID.
   *
   * @param id ID of the student to delete.
   *
   * @returns Document of the deleted student.
   *
   * @throws `NotFoundException` - If no student with the given ID could be found.
   */
  async delete(id: string): Promise<StudentDocument> {
    const student = await this.findById(id);

    return student.remove();
  }
}
