import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
    BadRequestException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { ITeam, ITeamId } from 'shared/model/Team';
import { Student } from '../../database/entities/student.entity';
import { Team } from '../../database/entities/team.entity';
import { Tutorial } from '../../database/entities/tutorial.entity';
import { GradingService } from '../student/grading.service';
import { StudentService } from '../student/student.service';
import { TutorialService } from '../tutorial/tutorial.service';
import { TeamDTO } from './team.dto';

@Injectable()
export class TeamService {
    constructor(
        @Inject(forwardRef(() => TutorialService))
        private readonly tutorialService: TutorialService,
        @Inject(forwardRef(() => StudentService))
        private readonly studentService: StudentService,
        @Inject(forwardRef(() => GradingService))
        private readonly gradingService: GradingService,
        @InjectRepository(Team)
        private readonly repository: EntityRepository<Team>
    ) {}

    /**
     * @param tutorialId Tutorial ID to get teams for
     *
     * @returns All teams in the given tutorial.
     */
    async findAllTeamsInTutorial(tutorialId: string): Promise<Team[]> {
        return this.repository.find({ tutorial: tutorialId }, { populate: true });
    }

    /**
     * Searches the team with the given ID which is in the given tutorial and returns it.
     *
     * @param tutorialId Id of the tutorial the team is in.
     * @param teamId Id of the team to search.
     *
     * @returns Team in the given tutorial with the given teamId.
     *
     * @throws `NotFoundException` - If no team inside the given tutorial with the given ID could be found.
     */
    async findById({ tutorialId, teamId }: ITeamId): Promise<Team> {
        const team = await this.repository.findOne(
            { id: teamId, tutorial: tutorialId },
            { populate: true }
        );

        if (!team) {
            throw new NotFoundException(
                `Could not find the team with the ID '${teamId}' in the tutorial with the ID ${tutorialId}`
            );
        }

        return team;
    }

    /**
     * Creates a team in the given tutorial with the given information from the DTO.
     *
     * This functions also updates all students in the dto to have the newly created team.
     *
     * @param tutorialId Tutorial to create team in.
     * @param dto Information to create the team with.
     *
     * @returns Created team.
     *
     * @throws `NotFoundException` - If no tutorial with the given ID could be found or if any student provided by the DTO could not be found.
     */
    async createTeamInTutorial(tutorialId: string, dto: TeamDTO): Promise<ITeam> {
        const tutorial = await this.tutorialService.findById(tutorialId);
        const students: Student[] = await this.studentService.findMany(dto.students);

        this.assertAllStudentsInSameTutorial(tutorialId, students);

        const team = new Team({
            teamNo: this.getFirstAvailableTeamNo(tutorial),
            tutorial,
        });
        team.students.set(students);

        await this.repository.persistAndFlush(team);
        return team.toDTO();
    }

    /**
     * Creates a team in the given tutorial without any students.
     * Does not flush the entityManager.
     *
     * @param tutorial Tutorial to create team in.
     *
     * @returns Created team.
     */
     createTeamWithoutStudents(tutorial: Tutorial): Team {
        const team = new Team({
            teamNo: this.getFirstAvailableTeamNo(tutorial),
            tutorial,
        });

        this.repository.persist(team);
        return team;
    }

    /**
     * Updates the given team in the tutorial with the given information.
     *
     * This function updates all students related to the team in the following way:
     * - All previously assigned students get their team removed and be saved back to the DB.
     * - All students provided by the DTO will get their team assigned and be saved back to the DB.
     *
     * @param teamId ID of the team inside a tutorial to update.
     * @param dto Information to update the team with.
     *
     * @returns Updated team.
     *
     * @throws `NotFoundException` - If not team with the given ID could be found in the tutorial or if any of the provided students in the DTO could not be found.
     */
    async updateTeamInTutorial(teamId: ITeamId, { students }: TeamDTO): Promise<ITeam> {
        const team = await this.findById(teamId);
        const newStudentsOfTeam = await this.studentService.findMany(students);

        this.assertAllStudentsInSameTutorial(teamId.tutorialId, newStudentsOfTeam);

        team.students.set(newStudentsOfTeam);
        await this.repository.persistAndFlush(team);

        return team.toDTO();
    }

    /**
     * Deletes the given team from the given tutorial (and the DB). This function also removes the team from all associated students.
     *
     * @param teamId ID of the team to delete in the tutorial.
     *
     * @returns Deleted TeamDocument.
     *
     * @throws `NotFoundException` - If no team with the given ID could be found in the given tutorial.
     */
    async deleteTeamFromTutorial(teamId: ITeamId): Promise<void> {
        const team = await this.findById(teamId);
        const repo = this.repository;
        team.tutorial.teams.remove(team);
        team.students.removeAll();

        await repo.removeAndFlush(team);
    }

    /**
     * Returns the first available team number in the given tutorial.
     *
     * Team numbers are ascending numbers. However, this function will try to fill holes in the numbering first.
     *
     * @param tutorial Tutorial of the team.
     *
     * @returns First available team number in the tutorial.
     */
    private getFirstAvailableTeamNo(tutorial: Tutorial): number {
        for (let i = 1; i <= tutorial.teams.length; i++) {
            let isTeamNoInUse = false;

            for (const team of tutorial.teams) {
                if (team.teamNo === i) {
                    isTeamNoInUse = true;
                    break;
                }
            }

            if (!isTeamNoInUse) {
                return i;
            }
        }

        return tutorial.teams.length + 1;
    }

    /**
     * Checks if all students are in the same tutorial. If they are NOT an exception is thrown.
     *
     * @param tutorialId ID of the tutorial the students should be in.
     * @param students Students to check
     *
     * @throws `BadRequestException` - If NOT all students are in the same tutorial.
     */
    private assertAllStudentsInSameTutorial(tutorialId: string, students: Student[]) {
        if (students.length === 0) {
            return;
        }

        for (const student of students) {
            if (student.tutorial.id !== tutorialId) {
                throw new BadRequestException(
                    `All students in a team must be in the same tutorial.`
                );
            }
        }
    }
}
