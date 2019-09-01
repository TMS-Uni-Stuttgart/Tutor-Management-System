import { Student, StudentDTO } from 'shared/dist/model/Student';
import { isDocument } from 'typegoose/lib/utils';
import { getIdOfDocumentRef } from '../../helpers/documentHelpers';
import StudentModel, { StudentDocument } from '../../model/documents/StudentDocument';
import { DocumentNotFoundError } from '../../model/Errors';
import tutorialService from '../tutorial-service/TutorialService.class';
import { TutorialDocument } from '../../model/documents/TutorialDocument';

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
    const tutorial = await tutorialService.getDocumentWithID(dto.tutorial);
    const createdStudent = await StudentModel.create({ ...dto, tutorial });

    tutorial.students.push(createdStudent);
    await tutorial.save();

    // TODO: Check team

    return this.getStudentOrReject(createdStudent);
  }

  public async updateStudent(id: string, { tutorial, ...dto }: StudentDTO): Promise<Student> {
    const student = await this.getDocumentWithId(id);

    // TODO: Check team

    if (getIdOfDocumentRef(student.tutorial) !== tutorial) {
      await this.moveStudentToBeAttendeeOfNewTutorial(student, tutorial);
    }

    const updatedStudent = await student.updateOne({ ...dto, tutorial: student.tutorial });

    return this.getStudentOrReject(updatedStudent);
  }

  public async deleteStudent(id: string): Promise<Student> {
    const student: StudentDocument = await this.getDocumentWithId(id);
    const tutorial: TutorialDocument = await tutorialService.getDocumentWithID(
      getIdOfDocumentRef(student.tutorial)
    );

    // TODO: Adjust team

    tutorial.students = tutorial.students.filter(
      stud => getIdOfDocumentRef(stud) !== student._id.toString()
    );
    await tutorial.save();

    return this.getStudentOrReject(await student.remove());
  }

  public async getStudentWithId(id: string): Promise<Student> {
    const student: StudentDocument | null = await this.getDocumentWithId(id);

    return this.getStudentOrReject(student);
  }

  public async getDocumentWithId(id: string): Promise<StudentDocument> {
    const student: StudentDocument | null = await StudentModel.findById(id);

    if (!student) {
      return this.rejectStudentNotFound();
    }

    return student;
  }

  public async getStudentOrReject(student: StudentDocument | null): Promise<Student> {
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

  /**
   * Adds the StudentDocument to the given TutorialDocument.
   *
   * The Tutorial will get added to the given TutorialDocument. This will save the TutorialDocument in the end.
   *
   * The StudentDocument will get adjusted aswell to be in the given Tutorial.
   *
   * By default this will __not__ save the StudentDocument after adding the TutorialDocument. To do so provide the `saveStudent` option with a truthy value.
   *
   * @param student Student to add to the document
   * @param tutorialId ID of the tutorial to add the student to
   * @param options _(optional)_ Special options to be passed. Defaults to an empty object.
   */
  public async addStudentToTutorial(
    student: StudentDocument,
    tutorialId: string,
    { saveStudent }: { saveStudent?: boolean } = {}
  ): Promise<void> {
    if (tutorialId === getIdOfDocumentRef(student.tutorial)) {
      return;
    }

    const tutorial = await tutorialService.getDocumentWithID(tutorialId);

    student.tutorial = tutorial;
    tutorial.students.push(student);

    if (saveStudent) {
      await Promise.all([tutorial.save(), student.save()]);
    } else {
      await tutorial.save();
    }
  }

  /**
   * Moves the Student from her Tutorial to the given new one.
   *
   * The current Tutorial of the Student will be adjusted to NOT include her anymore. The new Tutorial will get the new Student added to it. Both TutorialDocuments will be saved in the end.
   *
   * The StudentDocument gets adjusted aswell to reflect the change of the Tutorial.
   *
   * If the new tutorial is the same as the old one the function will abort early and no write actions are performed on the date.
   *
   * By default this function will __NOT__ save the StudentDocument after the change of Tutorials. To do so provide the `saveStudent` option with a truthy value.
   *
   * @param student Student to move between tutorials
   * @param newTutorialId ID of the new tutorial the Student gets moved to
   * @param options _(optional) Special options to be passed. Defaults to an empty object.
   */
  public async moveStudentToBeAttendeeOfNewTutorial(
    student: StudentDocument,
    newTutorialId: string,
    { saveStudent }: { saveStudent?: boolean } = {}
  ): Promise<void> {
    const newTutorial = await tutorialService.getDocumentWithID(newTutorialId);
    const oldTutorial = isDocument(student.tutorial)
      ? student.tutorial
      : await tutorialService.getDocumentWithID(student.tutorial.toString());

    if (newTutorialId === oldTutorial._id.toString()) {
      return;
    }

    const studentId: string = student._id.toString();

    oldTutorial.students = oldTutorial.students.filter(
      stud => studentId !== getIdOfDocumentRef(stud)
    );

    newTutorial.students.push(student);
    student.tutorial = newTutorial;

    // TODO: Adjust points of student.

    if (saveStudent) {
      await Promise.all([oldTutorial.save(), newTutorial.save(), student.save()]);
    } else {
      await Promise.all([oldTutorial.save(), newTutorial.save()]);
    }
  }

  private async rejectStudentNotFound(): Promise<any> {
    return Promise.reject(new DocumentNotFoundError('Student with that ID was not found.'));
  }
}

const studentService = new StudentService();

export default studentService;
