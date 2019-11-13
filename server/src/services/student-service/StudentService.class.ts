import { isDocument } from '@hasezoey/typegoose';
import { Types } from 'mongoose';
import { EncryptedDocument } from 'mongoose-field-encryption';
import { Attendance, AttendanceDTO } from 'shared/dist/model/Attendance';
import { PointMap, UpdatePointsDTO } from 'shared/dist/model/Points';
import {
  PresentationPointsDTO,
  Student,
  StudentDTO,
  CakeCountDTO,
} from 'shared/dist/model/Student';
import { getIdOfDocumentRef } from '../../helpers/documentHelpers';
import { TypegooseDocument } from '../../helpers/typings';
import {
  AttendanceDocument,
  generateAttendanceDocumentFromDTO,
} from '../../model/documents/AttendanceDocument';
import StudentModel, {
  StudentDocument,
  StudentSchema,
} from '../../model/documents/StudentDocument';
import { TutorialDocument } from '../../model/documents/TutorialDocument';
import { DocumentNotFoundError } from '../../model/Errors';
import scheinexamService from '../scheinexam-service/ScheinexamService.class';
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

  public async createStudent({ tutorial: tutorialId, ...dto }: StudentDTO): Promise<Student> {
    const tutorial = await tutorialService.getDocumentWithID(tutorialId);

    const studentData: TypegooseDocument<StudentSchema> = {
      ...dto,
      tutorial,
      team: undefined,
      points: {},
      scheinExamResults: {},
      cakeCount: 0,
    };
    const createdStudent = await StudentModel.create(studentData);

    this.makeStudentAttendeeOfTutorial(createdStudent, tutorial.id, { saveStudent: false });

    if (dto.team) {
      await teamService.makeStudentMemberOfTeam(createdStudent, dto.team, { saveStudent: true });
    }

    return this.getStudentOrReject(createdStudent);
  }

  public async updateStudent(
    id: string,
    { tutorial, courseOfStudies, email, matriculationNo, team, ...dto }: StudentDTO
  ): Promise<Student> {
    const student = await this.getDocumentWithId(id);

    if (team) {
      await teamService.makeStudentMemberOfTeam(student, team, { saveStudent: false });
    } else {
      await teamService.removeStudentAsMemberFromTeam(student, { saveStudent: false });
    }

    if (getIdOfDocumentRef(student.tutorial) !== tutorial) {
      await this.moveStudentToBeAttendeeOfNewTutorial(student, tutorial);
    }

    const updatedStudent: TypegooseDocument<StudentSchema> = {
      ...dto,
      matriculationNo: matriculationNo || '',
      email: email || '',
      courseOfStudies: courseOfStudies || '',
      tutorial: student.tutorial,
      team: student.team,
      points: student.points,
      scheinExamResults: student.scheinExamResults,
      cakeCount: student.cakeCount,
    };

    // Encrypt the student manually due to the encryption library not supporting 'updateOne()'.
    const encryptedStudent = new StudentModel(updatedStudent) as EncryptedDocument<StudentDocument>;
    encryptedStudent._id = student._id;
    encryptedStudent.encryptFieldsSync();

    await student.updateOne(encryptedStudent);

    return this.getStudentOrReject(await this.getDocumentWithId(id));
  }

  public async deleteStudent(id: string): Promise<Student> {
    const student: StudentDocument = await this.getDocumentWithId(id);

    if (await student.getTeam()) {
      await teamService.removeStudentAsMemberFromTeam(student, { saveStudent: true });
    }

    const tutorial: TutorialDocument = await tutorialService.getDocumentWithID(
      getIdOfDocumentRef(student.tutorial)
    );

    tutorial.students = tutorial.students.filter(stud => getIdOfDocumentRef(stud) !== student.id);

    tutorial.markModified('students');
    await tutorial.save();

    return this.getStudentOrReject(await student.remove());
  }

  public async setAttendance(id: string, attendanceDTO: AttendanceDTO): Promise<Attendance> {
    const student = await this.getDocumentWithId(id);
    const attendanceDocument = generateAttendanceDocumentFromDTO(attendanceDTO);

    student.setAttendance(attendanceDocument);

    await student.save();

    return this.getAttendanceFromDocument(attendanceDocument);
  }

  public async setPoints(id: string, { id: sheetId, exercises: pointsGained }: UpdatePointsDTO) {
    const student = await this.getDocumentWithId(id);

    if (!(await sheetService.doesSheetWithIdExist(sheetId))) {
      return Promise.reject(
        new DocumentNotFoundError('Sheet with the given ID does not exist on the server.')
      );
    }

    const pointMapOfStudent = new PointMap(student.points);

    pointMapOfStudent.adjustPoints(new PointMap(pointsGained));
    student.points = pointMapOfStudent.toDTO();

    await student.save();
  }

  public async setExamResults(
    id: string,
    { id: examId, exercises: pointsGained }: UpdatePointsDTO
  ) {
    const student = await this.getDocumentWithId(id);

    if (!(await scheinexamService.doesScheinexamWithIdExist(examId))) {
      return Promise.reject(
        new DocumentNotFoundError('Scheinexam with the given ID does not exist on the server.')
      );
    }

    const pointMapOfStudent = new PointMap(student.scheinExamResults);

    pointMapOfStudent.adjustPoints(new PointMap(pointsGained));
    student.scheinExamResults = pointMapOfStudent.toDTO();

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

  public async setCakeCount(studentId: string, cakeDTO: CakeCountDTO) {
    const student = await this.getDocumentWithId(studentId);

    student.cakeCount = cakeDTO.cakeCount;

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

    // Make sure we get a document with decrypted fields.
    (student as EncryptedDocument<StudentDocument>).decryptFieldsSync();

    const {
      id,
      firstname,
      lastname,
      matriculationNo,
      email,
      courseOfStudies,
      tutorial,
      attendance,
      presentationPoints,
      scheinExamResults,
      cakeCount,
    } = student;

    const parsedAttendances: Student['attendance'] = {};

    if (attendance) {
      for (const [key, att] of attendance) {
        parsedAttendances[key] = this.getAttendanceFromDocument(att);
      }
    }

    const team = await student.getTeam();
    const points: Student['points'] = (await student.getPoints()).toDTO();

    return {
      id,
      firstname,
      lastname,
      matriculationNo,
      email,
      courseOfStudies,
      tutorial: getIdOfDocumentRef(tutorial),
      team: team ? { id: team.id, teamNo: team.teamNo } : undefined,
      attendance: parsedAttendances,
      points,
      presentationPoints: presentationPoints
        ? presentationPoints.toObject({ flattenMaps: true })
        : {},
      scheinExamResults: scheinExamResults,
      cakeCount,
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

    await teamService.removeStudentAsMemberFromTeam(student, { saveStudent: false });

    newTutorial.students.push(student);
    student.tutorial = newTutorial;

    if (saveStudent) {
      await Promise.all([oldTutorial.save(), newTutorial.save(), student.save()]);
    } else {
      await Promise.all([oldTutorial.save(), newTutorial.save()]);
    }
  }

  public async movePointsFromTeamToStudent(student: StudentDocument) {
    const team = await student.getTeam();

    if (!team) {
      return;
    }

    const pointsOfTeam = new PointMap(team.points);
    const pointsOfStudent = new PointMap(student.points);

    pointsOfTeam.getEntries().forEach(([key, entry]) => {
      if (!pointsOfStudent.has(key)) {
        pointsOfStudent.setPointsByKey(key, entry);
      }
    });

    student.points = pointsOfStudent.toDTO();
  }

  /**
   *  Returns if the given student is an attendee in the given Tutorial.
   *
   * @param student Student to check.
   * @param tutorial Tutorial to check.
   */
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
