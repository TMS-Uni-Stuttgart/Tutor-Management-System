import { EntityRepository } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Tutorial } from 'database/entities/tutorial.entity';
import { IAttendance } from 'shared/model/Attendance';
import { IStudent } from 'shared/model/Student';
import { Attendance } from '../../database/entities/attendance.entity';
import { Student } from '../../database/entities/student.entity';
import { Team } from '../../database/entities/team.entity';
import { CRUDService } from '../../helpers/CRUDService';
import { SheetService } from '../sheet/sheet.service';
import { TeamService } from '../team/team.service';
import { TutorialService } from '../tutorial/tutorial.service';
import {
    AttendanceDTO,
    CakeCountDTO,
    CreateStudentDTO,
    CreateStudentsDTO,
    PresentationPointsDTO,
    StudentDTO,
} from './student.dto';

@Injectable()
export class StudentService implements CRUDService<IStudent, CreateStudentDTO, Student> {
    private readonly logger = new Logger(StudentService.name);

    constructor(
        @Inject(forwardRef(() => TutorialService))
        private readonly tutorialService: TutorialService,
        @Inject(forwardRef(() => TeamService))
        private readonly teamService: TeamService,
        private readonly sheetService: SheetService,
        @InjectRepository(Student)
        private readonly repository: EntityRepository<Student>,
        @Inject(EntityManager)
        private readonly em: EntityManager
    ) {}

    /**
     * @returns All students saved in the database.
     */
    async findAll(): Promise<Student[]> {
        const timeA = Date.now();
        const allStudents = await this.repository.findAll({
            populate: ['*'],
        });
        const timeB = Date.now();

        this.logger.log(`Time to fetch all students: ${timeB - timeA}ms`);
        return allStudents;
    }

    /**
     * @param ids IDs of the students to get.
     * @returns Students with the given IDs.
     *
     * @throws {@link NotFoundException} - If at least one student could not be found.
     */
    async findMany(ids: string[]): Promise<Student[]> {
        const students = await this.repository.find({ id: { $in: ids } }, { populate: ['*'] });

        if (students.length !== ids.length) {
            const studentIds = students.map((student) => student.id);
            const notFound = ids.filter((id) => !studentIds.includes(id));
            throw new NotFoundException(
                `Could not find the students with the following ids: [${notFound.join(', ')}]`
            );
        }

        return students;
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
    async findById(id: string): Promise<Student> {
        const student = await this.repository.findOne({ id }, { populate: ['*'] });

        if (!student) {
            throw new NotFoundException(`Student with the ID ${id} could not be found`);
        }

        return student;
    }

    /**
     * Returns all students of the tutorial with the given ID.
     *
     * @param tutorialId ID of the tutorial to get the students of.
     *
     * @returns All students in this tutorial.
     *
     * @throws `NotFoundException` - If no tutorial with the given ID could be found.
     */
    async findOfTutorial(tutorialId: string): Promise<Student[]> {
        const tutorial = await this.tutorialService.findById(tutorialId);
        return tutorial.getStudents();
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
    async create(dto: CreateStudentDTO): Promise<IStudent> {
        const { team: teamId, tutorial: tutorialId } = dto;
        const tutorial = await this.tutorialService.findById(tutorialId);
        const team = !!teamId
            ? await this.teamService.findById({
                  tutorialId: tutorial.id,
                  teamId,
              })
            : undefined;
        const student = await this.createStudent(dto, tutorial, team);
        await this.em.flush();
        return student.toDTO();
    }

    /**
     * Creates many students from the given DTO and returns the created students.
     * For each student, if team is provided, if the team is the number of an existing team, the student is put into that team,
     * otherwise a new Team is created and associated with the provided string.
     *
     * @param dto DTO with the information for the students to create.
     *
     * @returns Created students.
     *
     * @throws `NotFoundException` - If the tutorial could not be found.
     */
    async createMany(dto: CreateStudentsDTO): Promise<IStudent[]> {
        const tutorial = await this.tutorialService.findById(dto.tutorial);
        const teamNos = new Set(dto.students.map((student) => student.team));
        const allTeams = await this.teamService.findAllTeamsInTutorial(dto.tutorial);
        const teamLookup = new Map<string | undefined, Team>();
        teamNos.forEach((teamNo) => {
            if (teamNo && /^[0-9]+$/.test(teamNo)) {
                const team = allTeams.find((it) => it.teamNo === parseInt(teamNo));
                if (team) {
                    teamLookup.set(teamNo, team);
                }
            }
        });
        teamNos.forEach((teamNo) => {
            if (teamNo && !teamLookup.has(teamNo)) {
                teamLookup.set(teamNo, this.teamService.createTeamWithoutStudents(tutorial));
            }
        });

        const students = await Promise.all(
            dto.students.map((student) => {
                return this.createStudent(student, tutorial, teamLookup.get(student.team));
            })
        );
        await this.em.flush();
        return students.map((student) => student.toDTO());
    }

    /**
     * Creates a student from the given DTO and returns the created student.
     *
     * @param dto DTO with the information for the student to create.
     * @param tutorial the Tutorial the created Student is created at.
     * @param team the Team the created Student is put in.
     *
     * @returns Created student.
     */
    private async createStudent(
        dto: StudentDTO,
        tutorial: Tutorial,
        team?: Team
    ): Promise<Student> {
        const student = new Student({
            firstname: dto.firstname,
            lastname: dto.lastname,
            matriculationNo: dto.matriculationNo,
            status: dto.status,
            tutorial,
        });
        student.courseOfStudies = dto.courseOfStudies;
        student.email = dto.email;
        student.iliasName = dto.iliasName;
        student.team = team;

        this.em.persist(student);
        return student;
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
    async update(id: string, dto: CreateStudentDTO): Promise<IStudent> {
        const student = await this.findById(id);
        student.team = await this.getTeamFromDTO(dto, student);

        if (dto.tutorial !== student.tutorial.id) {
            student.tutorial = await this.tutorialService.findById(dto.tutorial);
            student.team = undefined;
        }

        student.firstname = dto.firstname;
        student.lastname = dto.lastname;
        student.iliasName = dto.iliasName;
        student.status = dto.status;
        student.courseOfStudies = dto.courseOfStudies;
        student.email = dto.email;
        student.matriculationNo = dto.matriculationNo;

        await this.em.persistAndFlush(student);
        return student.toDTO();
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
    async delete(id: string): Promise<void> {
        const student = await this.findById(id);
        await this.em.removeAndFlush(student);
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
        const attendance = Attendance.fromDTO(dto);

        student.setAttendance(attendance);
        await this.em.persistAndFlush(student);

        return attendance.toDTO();
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
        await this.em.persistAndFlush(student);
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
        await this.em.persistAndFlush(student);
    }

    private async getTeamFromDTO(
        dto: CreateStudentDTO,
        student: Student
    ): Promise<Team | undefined> {
        if (!dto.team) {
            return undefined;
        }

        return this.teamService.findById({
            tutorialId: student.tutorial.id,
            teamId: dto.team,
        });
    }
}
