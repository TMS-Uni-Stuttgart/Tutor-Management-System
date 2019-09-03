import { Types } from 'mongoose';
import { Attendance, AttendanceDTO } from 'shared/dist/model/Attendance';
import { PointId, UpdatePointsDTO } from 'shared/dist/model/Sheet';
import { PresentationPointsDTO, Student, StudentDTO } from 'shared/dist/model/Student';
import { isDocument } from 'typegoose/lib/utils';
import { getIdOfDocumentRef } from '../../helpers/documentHelpers';
import {
  AttendanceDocument,
  generateAttendanceDocumentFromDTO,
} from '../../model/documents/AttendanceDocument';
import StudentModel, { StudentDocument } from '../../model/documents/StudentDocument';
import { TutorialDocument } from '../../model/documents/TutorialDocument';
import { DocumentNotFoundError } from '../../model/Errors';
import sheetService from '../sheet-service/SheetService.class';
import teamService from '../team-service/TeamService.class';
import tutorialService from '../tutorial-service/TutorialService.class';

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

    this.makeStudentAttendeeOfTutorial(createdStudent, tutorial.id, { saveStudent: false });

    if (dto.team) {
      await teamService.makeStudentMemberOfTeam(createdStudent, dto.team, { saveStudent: true });
    }

    return this.getStudentOrReject(createdStudent);
  }

  public async updateStudent(id: string, { tutorial, ...dto }: StudentDTO): Promise<Student> {
    const student = await this.getDocumentWithId(id);

    if (dto.team) {
      await teamService.makeStudentMemberOfTeam(student, dto.team, { saveStudent: false });
    } else {
      await teamService.removeStudentAsMemberFromTeam(student, { saveStudent: false });
    }

    if (getIdOfDocumentRef(student.tutorial) !== tutorial) {
      await this.moveStudentToBeAttendeeOfNewTutorial(student, tutorial);
    }

    await student.updateOne({
      ...dto,
      tutorial: student.tutorial,
      team: student.team,
    });

    // const updatedStudent = await this.getDocumentWithId(student.id);

    return this.getStudentOrReject(student);
  }

  public async deleteStudent(id: string): Promise<Student> {
    const student: StudentDocument = await this.getDocumentWithId(id);
    const tutorial: TutorialDocument = await tutorialService.getDocumentWithID(
      getIdOfDocumentRef(student.tutorial)
    );

    if (student.team) {
      await teamService.removeStudentAsMemberFromTeam(student, { saveStudent: false });
    }

    tutorial.students = tutorial.students.filter(
      stud => getIdOfDocumentRef(stud) !== student.id
    );
    await tutorial.save();

    return this.getStudentOrReject(await student.remove());
  }

  public async setAttendance(id: string, attendanceDTO: AttendanceDTO): Promise<Attendance> {
    const student = await this.getDocumentWithId(id);
    const attendanceDocument = generateAttendanceDocumentFromDTO(attendanceDTO);

    if (!student.attendance) {
      student.attendance = new Types.Map();
    }

    student.attendance.set(attendanceDocument.date.toDateString(), attendanceDocument);

    await student.save();

    return this.getAttendanceFromDocument(attendanceDocument);
  }

  public async setPoints(id: string, { id: sheetId, exercises }: UpdatePointsDTO) {
    const student = await this.getDocumentWithId(id);
    const sheet = await sheetService.getDocumentWithId(sheetId);

    if (!student.points) {
      student.points = new Types.Map();
    }

    for (const [exNo, points] of Object.entries(exercises)) {
      const exercise = sheet.exercises.find(ex => ex.exNo.toString() === exNo);

      if (exercise) {
        const pointId = new PointId(sheetId, exercise.exNo);
        student.points.set(pointId.toString(), points);
      }
    }

    await student.save();
  }

  public async setPresentationPoints(id: string, { sheetId, points }: PresentationPointsDTO) {
    const student = await this.getDocumentWithId(id);

    if (!(await sheetService.doesSheetWithIdExist(sheetId))) {
      return sheetService.rejectSheetNotFound();
    }

    if (!student.presentationPoints) {
      student.presentationPoints = new Types.Map();
    }

    student.presentationPoints.set(sheetId, points);

    await student.save();
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

    const parsedAttendances: Student['attendance'] = {};

    if (attendance) {
      for (const [key, att] of attendance) {
        parsedAttendances[key] = this.getAttendanceFromDocument(att);
      }
    }

    return {
      id: _id,
      firstname,
      lastname,
      matriculationNo,
      email,
      courseOfStudies,
      tutorial: getIdOfDocumentRef(tutorial),
      team: team ? getIdOfDocumentRef(team) : undefined,
      attendance: parsedAttendances,
      points: points ? points.toObject({ flattenMaps: true }) : {},
      presentationPoints: presentationPoints
        ? presentationPoints.toObject({ flattenMaps: true })
        : {},
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
  public async makeStudentAttendeeOfTutorial(
    student: StudentDocument,
    tutorialId: string,
    { saveStudent }: { saveStudent?: boolean } = {}
  ): Promise<void> {
    const tutorial = await tutorialService.getDocumentWithID(tutorialId);

    if (this.isStudentAttendeeOfTutorial(student, tutorial)) {
      return;
    }

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

    if (this.isStudentAttendeeOfTutorial(student, newTutorial)) {
      return;
    }

    const oldTutorial = isDocument(student.tutorial)
      ? student.tutorial
      : await tutorialService.getDocumentWithID(student.tutorial.toString());

    const studentId: string = student.id;

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

  private isStudentAttendeeOfTutorial(
    student: StudentDocument,
    tutorial: TutorialDocument
  ): boolean {
    for (const doc of tutorial.students) {
      if (getIdOfDocumentRef(doc) === student.id) {
        return true;
      }
    }

    return false;
  }

  private getAttendanceFromDocument(attendanceDocument: AttendanceDocument): Attendance {
    return {
      date: attendanceDocument.date,
      state: attendanceDocument.state,
      note: attendanceDocument.note,
    };
  }

  private async rejectStudentNotFound(): Promise<any> {
    return Promise.reject(new DocumentNotFoundError('Student with that ID was not found.'));
  }
}

const studentService = new StudentService();

export default studentService;
