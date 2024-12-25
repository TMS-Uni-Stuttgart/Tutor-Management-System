import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ITeam, ITeamId } from 'shared/model/Team';
import { sortListById } from '../../../test/helpers/test.helpers';
import { TestSuite } from '../../../test/helpers/TestSuite';
import { MOCKED_STUDENTS, MOCKED_TEAMS, MOCKED_TUTORIALS } from '../../../test/mocks/entities.mock';
import { Team } from '../../database/entities/team.entity';
import { TeamDTO } from './team.dto';
import { TeamService } from './team.service';
import { TeamModule } from './team.module';

interface AssertTeamParams {
    expected: Team;
    actual: ITeam;
}

interface AssertTeamListParams {
    expected: Team[];
    actual: ITeam[];
}

interface AssertTeamDTOParams {
    expected: TeamDTO;
    actual: ITeam;
}

/**
 * Checks if the actual Team matches the expected one.
 *
 * Equality is defined by:
 * - All properties match
 * - All students have the correct team assigned.
 *
 * @param params Must contain an actual and an expected Team.
 */
function assertTeam({ expected, actual }: AssertTeamParams) {
    const { id, tutorial, students, teamNo } = expected;
    const {
        id: actualId,
        tutorial: actualTutorial,
        students: actualStudents,
        teamNo: actualTeamNo,
    } = actual;

    expect(actualId).toEqual(id);
    expect(actualTutorial).toEqual(tutorial.id);
    expect(actualTeamNo).toEqual(teamNo);

    expect(sortListById(actualStudents).map((s) => s.id)).toEqual(
        sortListById(students.getItems()).map((s) => s.id)
    );

    actualStudents.forEach((student) => {
        expect(student.team?.id).toEqual(id);
    });
}

/**
 * Checks if the actual list of teams matches the expected one.
 *
 * Equality is defined as:
 * - All elements in the arrays must be equal as defined by {@link assertTeam}.
 *
 * @param params Must contain a list of actual Teams and expected TeamDocuments.
 */
function assertTeamList({ expected, actual }: AssertTeamListParams) {
    expect(actual.length).toEqual(expected.length);

    const expectedList = sortListById(expected);
    const actualList = sortListById(actual);

    for (let i = 0; i < actual.length; i++) {
        assertTeam({ expected: expectedList[i], actual: actualList[i] });
    }
}

/**
 * Checks if the actual team matches the expected DTO.
 *
 * Equality is defined by:
 * - `actual.id` is defined.
 * - All students of the DTO are in the team and have the team assigned to them.
 *
 * @param params Must contain an actual Team and the expected TeamDTO.
 */
function assertTeamDTO({ expected, actual }: AssertTeamDTOParams) {
    const { students } = expected;
    const { id, students: actualStudents } = actual;

    expect(id).toBeDefined();
    expect(actualStudents.map((s) => s.id).sort()).toEqual(students.sort());

    actualStudents.forEach((student) => {
        expect(student.team?.id).toEqual(id);
    });
}

function getTutorialIdOfAllTeams(): string {
    return MOCKED_TUTORIALS[0].id;
}

describe('TeamService', () => {
    const suite = new TestSuite(TeamService, TeamModule);

    it('find all teams in tutorial', async () => {
        const teams = await suite.service.findAllTeamsInTutorial(getTutorialIdOfAllTeams());

        assertTeamList({
            expected: MOCKED_TEAMS,
            actual: teams.map((team) => team.toDTO()),
        });
    });

    it('find specific team', async () => {
        const expected = MOCKED_TEAMS[0];
        const team = await suite.service.findById({
            tutorialId: getTutorialIdOfAllTeams(),
            teamId: expected.id,
        });

        assertTeam({ expected, actual: team.toDTO() });
    });

    it('fail on finding non-existing team', async () => {
        const nonExisting = 'non-existing-id';

        await expect(
            suite.service.findById({
                tutorialId: getTutorialIdOfAllTeams(),
                teamId: nonExisting,
            })
        ).rejects.toThrow(NotFoundException);
    });

    it('create a new team without students', async () => {
        const dto: TeamDTO = {
            students: [],
        };

        const team = await suite.service.createTeamInTutorial(getTutorialIdOfAllTeams(), dto);

        assertTeamDTO({ expected: dto, actual: team });
    });

    it('create a new team with students', async () => {
        const dto: TeamDTO = {
            students: [MOCKED_STUDENTS[0].id, MOCKED_STUDENTS[1].id],
        };

        const team = await suite.service.createTeamInTutorial(getTutorialIdOfAllTeams(), dto);

        assertTeamDTO({ expected: dto, actual: team });
    });

    it('fail on creating team inside non-existing tutorial', async () => {
        const nonExisting = 'non-existing-id';
        const dto: TeamDTO = {
            students: [MOCKED_STUDENTS[0].id, MOCKED_STUDENTS[1].id],
        };

        await expect(suite.service.createTeamInTutorial(nonExisting, dto)).rejects.toThrow(
            NotFoundException
        );
    });

    it('fail on creating team with non-existing student', async () => {
        const nonExisting = 'non-existing-id';
        const dto: TeamDTO = {
            students: [nonExisting, MOCKED_STUDENTS[0].id],
        };

        await expect(
            suite.service.createTeamInTutorial(getTutorialIdOfAllTeams(), dto)
        ).rejects.toThrow(NotFoundException);
    });

    it('fail on creating team with students which are in different tutorials', async () => {
        const dto: TeamDTO = {
            students: [MOCKED_STUDENTS[0].id, MOCKED_STUDENTS[3].id],
        };

        await expect(
            suite.service.createTeamInTutorial(getTutorialIdOfAllTeams(), dto)
        ).rejects.toThrow(BadRequestException);
    });

    it('update a team', async () => {
        const updateDTO: TeamDTO = {
            students: [MOCKED_STUDENTS[0].id, MOCKED_STUDENTS[1].id],
        };
        const createDTO: TeamDTO = {
            students: [MOCKED_STUDENTS[2].id, MOCKED_STUDENTS[1].id],
        };

        const oldTeam = await suite.service.createTeamInTutorial(
            getTutorialIdOfAllTeams(),
            createDTO
        );
        const updated = await suite.service.updateTeamInTutorial(
            { tutorialId: getTutorialIdOfAllTeams(), teamId: oldTeam.id },
            updateDTO
        );

        assertTeamDTO({ expected: updateDTO, actual: updated });
    });

    it('fail on updating a team inside a non-existing tutorial', async () => {
        const updateDTO: TeamDTO = {
            students: [MOCKED_STUDENTS[0].id, MOCKED_STUDENTS[1].id],
        };
        const createDTO: TeamDTO = {
            students: [MOCKED_STUDENTS[2].id, MOCKED_STUDENTS[1].id],
        };
        const nonExisting = 'non-existing-id';

        const oldTeam = await suite.service.createTeamInTutorial(
            getTutorialIdOfAllTeams(),
            createDTO
        );

        await expect(
            suite.service.updateTeamInTutorial(
                { tutorialId: nonExisting, teamId: oldTeam.id },
                updateDTO
            )
        ).rejects.toThrow(NotFoundException);
    });

    it('fail on updating a team with non-existing student', async () => {
        const nonExisting = 'non-existing-id';
        const updateDTO: TeamDTO = {
            students: [nonExisting, MOCKED_STUDENTS[1].id],
        };
        const createDTO: TeamDTO = {
            students: [MOCKED_STUDENTS[2].id, MOCKED_STUDENTS[1].id],
        };

        const oldTeam = await suite.service.createTeamInTutorial(
            getTutorialIdOfAllTeams(),
            createDTO
        );

        await expect(
            suite.service.updateTeamInTutorial(
                { tutorialId: getTutorialIdOfAllTeams(), teamId: oldTeam.id },
                updateDTO
            )
        ).rejects.toThrow(NotFoundException);
    });

    it('fail on updating a team with students in different tutorials', async () => {
        const updateDTO: TeamDTO = {
            students: [MOCKED_STUDENTS[0].id, MOCKED_STUDENTS[3].id],
        };
        const createDTO: TeamDTO = {
            students: [MOCKED_STUDENTS[2].id, MOCKED_STUDENTS[1].id],
        };

        const team = await suite.service.createTeamInTutorial(getTutorialIdOfAllTeams(), createDTO);
        await expect(
            suite.service.updateTeamInTutorial(
                { tutorialId: getTutorialIdOfAllTeams(), teamId: team.id },
                updateDTO
            )
        ).rejects.toThrow(BadRequestException);
    });

    it('delete a team', async () => {
        const dto: TeamDTO = {
            students: [MOCKED_STUDENTS[0].id, MOCKED_STUDENTS[1].id],
        };

        const team = await suite.service.createTeamInTutorial(getTutorialIdOfAllTeams(), dto);
        const teamId: ITeamId = {
            tutorialId: getTutorialIdOfAllTeams(),
            teamId: team.id,
        };
        await suite.service.deleteTeamFromTutorial(teamId);

        await expect(suite.service.findById(teamId)).rejects.toThrow(NotFoundException);
    });

    it('fail on deleting a non-existing team', async () => {
        const nonExisting = 'non-existing-id';
        await expect(
            suite.service.deleteTeamFromTutorial({
                tutorialId: getTutorialIdOfAllTeams(),
                teamId: nonExisting,
            })
        ).rejects.toThrow(NotFoundException);
    });

    it('fail on deleting a team inside non-existing tutorial', async () => {
        const nonExisting = 'non-existing-id';
        await expect(
            suite.service.deleteTeamFromTutorial({
                tutorialId: nonExisting,
                teamId: MOCKED_TEAMS[0].id,
            })
        ).rejects.toThrow(NotFoundException);
    });
});
