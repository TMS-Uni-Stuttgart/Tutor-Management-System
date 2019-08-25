import { Student, StudentDTO } from 'shared/dist/model/Student';
import { getIdOfDocumentRef } from '../helpers/documentHelpers';
import StudentModel, { StudentDocument } from '../model/documents/StudentDocument';
import { DocumentNotFoundError } from '../model/Errors';

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
    const createdStudent = await StudentModel.create({ ...dto });

    // TODO: Adjust tutorial
    // TODO: Check team

    return this.getStudentOrReject(createdStudent);
  }

  public async updateStudent(id: string, dto: StudentDTO): Promise<Student> {
    const student = await this.getStudentDocumentWithId(id);

    // TODO: Check team
    // TODO: Adjust tutorial (adjust points if neccessary)

    const updatedStudent = await student.updateOne({ ...dto });

    console.log(updatedStudent);

    return this.getStudentOrReject(updatedStudent);
  }

  public async deleteStudent(id: string): Promise<StudentDocument> {
    const student: StudentDocument = await this.getStudentDocumentWithId(id);

    // TODO: Adjust team
    // TODO: Adjust tutorial

    return student.remove();
  }

  public async getStudentWithId(id: string): Promise<Student> {
    const student: StudentDocument | null = await this.getStudentDocumentWithId(id);

    return this.getStudentOrReject(student);
  }

  private async getStudentDocumentWithId(id: string): Promise<StudentDocument> {
    const student: StudentDocument | null = await StudentModel.findById(id);

    if (!student) {
      return this.rejectStudentNotFound();
    }

    return student;
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
      team: team ? getIdOfDocumentRef(team) : undefined,
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
