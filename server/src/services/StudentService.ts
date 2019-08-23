import { DocumentNotFoundError } from '../model/Errors';
import { getIdOfDocumentRef } from '../helpers/documentHelpers';
import { Student, StudentDTO } from 'shared/dist/model/Student';
import { StudentDocument } from '../model/documents/StudentDocument';

class StudentService {
  public async getAllStudents(): Promise<Student[]> {
    throw new Error('[StudentService] -- Not implemented yet.');
  }

  public async createStudent(dto: StudentDTO): Promise<Student> {
    throw new Error('[StudentService] -- Not implemented yet.');
  }

  public async updateStudent(id: string, dto: StudentDTO): Promise<Student> {
    throw new Error('[StudentService] -- Not implemented yet.');
  }

  public async deleteStudent(id: string): Promise<StudentDocument> {
    throw new Error('[StudentService] -- Not implemented yet.');
  }

  public async getStudentWithId(id: string): Promise<Student> {
    const student: StudentDocument | null = await this.getStudentDocumentWithId(id);

    return this.getStudentOrReject(student);
  }

  private async getStudentDocumentWithId(id: string): Promise<StudentDocument> {
    throw new Error('[StudentService] -- Not implemented yet.');
  }

  private async getStudentOrReject(student: StudentDocument | null): Promise<Student> {
    throw new Error('[StudentService] -- Not implemented yet.');
  }

  private async rejectStudentNotFound(): Promise<any> {
    return Promise.reject(new DocumentNotFoundError('Student with that ID was not found.'));
  }
}

const studentService = new StudentService();

export default studentService;
