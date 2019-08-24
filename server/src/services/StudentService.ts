import { DocumentNotFoundError } from '../model/Errors';
import { getIdOfDocumentRef } from '../helpers/documentHelpers';
import { Student, StudentDTO } from 'shared/dist/model/Student';
import StudentModel, { StudentDocument } from '../model/documents/StudentDocument';

class StudentService {
  public async getAllStudents(): Promise<Student[]> {
    const studentDocs: StudentDocument[] = await StudentModel.find();
    const students: Student[] = [];

    for (const doc of studentDocs) {
      students.push(await this.getStudentOrReject(doc));
    }

    return students;
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
    if (!student) {
      return this.rejectStudentNotFound();
    }

    const {
      _id,
      firstname,
      lastname,
      matriculationNo,
      email,
      courseOfStudies,
      tutorial,
      team,
      attendance,
      points,
      presentationPoints,
      scheinExamResults,
    } = student;

    return {
      id: _id,
      firstname,
      lastname,
      matriculationNo,
      email,
      courseOfStudies,
      tutorial: getIdOfDocumentRef(tutorial),
      team: getIdOfDocumentRef(team),
      attendance,
      points,
      presentationPoints,
      scheinExamResults,
    };
  }

  private async rejectStudentNotFound(): Promise<any> {
    return Promise.reject(new DocumentNotFoundError('Student with that ID was not found.'));
  }
}

const studentService = new StudentService();

export default studentService;
