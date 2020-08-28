import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { AttendanceModel } from '../../database/models/attendance.model';
import { HasExerciseDocuments } from '../../database/models/exercise.model';
import { GradingDocument, GradingModel } from '../../database/models/grading.model';
import { StudentDocument, StudentModel } from '../../database/models/student.model';
import { TeamDocument } from '../../database/models/team.model';
import { CRUDService } from '../../helpers/CRUDService';
import { IAttendance } from '../../shared/model/Attendance';
import { IStudent } from '../../shared/model/Student';
import { ScheinexamService } from '../scheinexam/scheinexam.service';
import { SheetService } from '../sheet/sheet.service';
import { ShortTestService } from '../short-test/short-test.service';
import { TeamService } from '../team/team.service';
import { TutorialService } from '../tutorial/tutorial.service';
import {
  AttendanceDTO,
  CakeCountDTO,
  GradingDTO,
  PresentationPointsDTO,
  StudentDTO,
} from './student.dto';

@Injectable()
export class StudentService implements CRUDService<IStudent, StudentDTO, StudentDocument> {
  private readonly logger = new Logger(StudentService.name);

  constructor(
    private readonly tutorialService: TutorialService,
    @Inject(forwardRef(() => TeamService))
    private readonly teamService: TeamService,
    private readonly sheetService: SheetService,
    private readonly scheinexamService: ScheinexamService,
    private readonly shortTestService: ShortTestService,
    @InjectModel(StudentModel)
    private readonly studentModel: ReturnModelType<typeof StudentModel>,
    @InjectModel(GradingModel)
    private readonly gradingModel: ReturnModelType<typeof GradingModel>
  ) {}

  /**
   * @returns All students saved in the database.
   */
  async findAll(): Promise<StudentDocument[]> {
    const timeA = Date.now();
    const allStudents = (await this.studentModel
      .find()
      .populate('_gradings')
      .exec()) as StudentDocument[];

    const timeB = Date.now();

    this.logger.log(`Time to fetch all students: ${timeB - timeA}ms`);
    return allStudents;
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
   * @throws `NotFoundException` - If the tutorial or the team of the student could not be found.
   */
  async create(dto: StudentDTO): Promise<IStudent> {
    const { tutorial: tutorialId, team: teamId, ...rest } = dto;
    const tutorial = await this.tutorialService.findById(tutorialId);
    const team = !!teamId
      ? await this.teamService.findById({ tutorialId: tutorial.id, teamId })
      : undefined;

    const doc = new StudentModel({
      ...rest,
      tutorial,
      team,
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
   * @throws `NotFoundException` - If the no student with the given ID or if the new tutorial (if it changes) or the new team of the student could not be found.
   */
  async update(id: string, dto: StudentDTO): Promise<IStudent> {
    const student = await this.findById(id);

    const team = await this.getTeamFromDTO(dto, student);
    student.team = team;

    if (dto.tutorial !== student.tutorial.id) {
      const tutorial = await this.tutorialService.findById(dto.tutorial);
      student.tutorial = tutorial;
      student.team = undefined;
    }

    student.markModified('team');

    student.firstname = dto.firstname;
    student.lastname = dto.lastname;
    student.iliasName = dto.iliasName;
    student.status = dto.status;
    student.courseOfStudies = dto.courseOfStudies;
    student.email = dto.email;
    student.matriculationNo = dto.matriculationNo;

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

  /**
   * Sets the attendance information from the DTO in the student with the given ID.
   *
   * @param id ID of the student to set the attendance of.
   * @param dto Information about the attendance to set.
   *
   * @returns Saved attendance.
   *
   * @throws `NotFoundException` - If no student with the given ID could be found.
   */
  async setAttendance(id: string, dto: AttendanceDTO): Promise<IAttendance> {
    const student = await this.findById(id);
    const attendance = AttendanceModel.fromDTO(dto);

    student.setAttendance(attendance);
    await student.save();

    return attendance.toDTO();
  }

  /**
   * Saves the given grading information as GradingDocument into the student with the given ID.
   *
   * If there already was a grading saved for the given `sheetId` the old one will be overridden.
   *
   * @param id ID of the student to save.
   * @param dto Information about the grading which should be saved.
   *
   * @throws `NotFoundException` - If either no student with the given ID or no sheet with the `sheetId` from the DTO could be found.
   * @throws `BadRequestException` - If the DTO could not be converted into a GradingDocument. See {@link GradingDocument#fromDTO} for more information.
   */
  async setGrading(id: string, dto: GradingDTO): Promise<void> {
    const student = await this.findById(id);
    const entityWithExercises = await this.getEntityWithExercisesFromDTO(dto);
    const grading = await this.getGradingFromDTO(dto);
    const prevGrading = student.getGrading(entityWithExercises);

    if (prevGrading && prevGrading.id !== grading.id) {
      prevGrading.removeStudent(student);
      await prevGrading.save();
    }

    grading.addStudent(student);
    await grading.save();
  }

  /**
   * Sets the gradings for multiple students by calling `setGrading` for each entry of the given map.
   *
   * @param dtos Map containing the grading DTOs keyed by student ids.
   */
  async setGradingOfMultipleStudents(dtos: Map<string, GradingDTO>): Promise<void> {
    const promises: Promise<void>[] = [];

    dtos.forEach((dto, studentId) => {
      promises.push(this.setGrading(studentId, dto));
    });

    await Promise.all(promises);
  }

  /**
   * Searches or creates the GradingDocument according to the given DTO.
   *
   * If the DTO does contain a `gradingId` field, the corresponding GradingDocument is fetched from the database, updated with the DTO and returned. Please note: The GradingDocument does __NOT__ get saved by this function.
   *
   * If the DTO does __NOT__ contain such a field, a new GradingDocument is generated from the DTO and returned. This documuent is also __NOT__ getting saved by this function.
   *
   * @param dto DTO to get the related GradingDocument of.
   *
   * @returns GradingDocument related to the given DTO.
   *
   * @throws `NotFoundException` - If the DTO contains a `gradingId` but no GradingDocument with such an ID could be found.
   */
  async getGradingFromDTO(dto: GradingDTO): Promise<GradingDocument> {
    let grading: GradingDocument | null;

    if (!!dto.gradingId) {
      grading = await this.gradingModel.findById(dto.gradingId);

      if (!grading) {
        throw new NotFoundException(`No grading with ID '${dto.gradingId}' could be found.`);
      }

      grading.updateFromDTO(dto);
    } else {
      grading = GradingModel.fromDTO(dto);
    }

    return grading;
  }

  /**
   * Updates the presentation points of the given student for the sheet given in the sheet ID.
   *
   * @param id ID of the student to update.
   * @param dto DTO holding the information to update the presentation points.
   *
   * @throws `NotFoundException` - If either no student with the given ID or no sheet with the `sheetId` from the DTO.
   */
  async setPresentationPoints(id: string, dto: PresentationPointsDTO): Promise<void> {
    const student = await this.findById(id);
    const sheet = await this.sheetService.findById(dto.sheetId);

    student.setPresentationPoints(sheet, dto.points);
    await student.save();
  }

  /**
   * Updates the cake count of the student with the given ID. The new cake count will be taken from the DTO.
   *
   * @param id ID of the student to change.
   * @param dto DTO containing the new cake count of the student.
   *
   * @throws `NotFoundException` - If no student with the given ID could be found.
   */
  async setCakeCount(id: string, dto: CakeCountDTO): Promise<void> {
    const student = await this.findById(id);

    student.cakeCount = dto.cakeCount;
    await student.save();
  }

  /**
   * Returns either a ScheinexamDocument or an ScheinexamDocument associated to the given DTO.
   *
   * If all fields, `sheetId`, `examId` and `shortTestId`, are set, an exception is thrown. An exception is also thrown if none of the both fields is set.
   *
   * @param dto DTO to return the associated document with exercises for.
   *
   * @returns Associated document with exercises.
   *
   * @throws `BadRequestException` - If either all fields (`sheetId`, `examId` and `shortTestId`) or none of those fields are set.
   */
  async getEntityWithExercisesFromDTO(dto: GradingDTO): Promise<HasExerciseDocuments> {
    const { sheetId, examId, shortTestId } = dto;

    if (!!sheetId && !!examId && !!shortTestId) {
      throw new BadRequestException(
        'You have to set exactly one of the three fields sheetId, examId and shortTestId - not all three.'
      );
    }

    if (!!sheetId) {
      return this.sheetService.findById(sheetId);
    }

    if (!!examId) {
      return this.scheinexamService.findById(examId);
    }

    if (!!shortTestId) {
      return this.shortTestService.findById(shortTestId);
    }

    throw new BadRequestException(
      'You have to either set the sheetId nor the examId nor the shortTestId field.'
    );
  }

  private async getTeamFromDTO(
    dto: StudentDTO,
    student: StudentDocument
  ): Promise<TeamDocument | undefined> {
    if (!dto.team) {
      return undefined;
    }

    return this.teamService.findById({ tutorialId: student.tutorial.id, teamId: dto.team });
  }
}
