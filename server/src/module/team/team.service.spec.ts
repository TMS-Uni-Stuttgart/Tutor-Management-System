import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { generateObjectId } from '../../../test/helpers/test.helpers';
import { TestModule } from '../../../test/helpers/test.module';
import { MockedModel } from '../../../test/helpers/testdocument';
import {
  STUDENT_DOCUMENTS,
  TEAM_DOCUMENTS,
  TUTORIAL_DOCUMENTS,
} from '../../../test/mocks/documents.mock';
import { TeamModel } from '../../database/models/team.model';
import { Team } from '../../shared/model/Team';
import { StudentService } from '../student/student.service';
import { TutorialService } from '../tutorial/tutorial.service';
import { UserService } from '../user/user.service';
import { TeamDTO } from './team.dto';
import { TeamID, TeamService } from './team.service';
import { SheetService } from '../sheet/sheet.service';
import { SheetDTO } from '../sheet/sheet.dto';
import { GradingDTO } from '../student/student.dto';
import { assertGrading } from '../student/student.service.spec';

interface AssertTeamParams {
  expected: MockedModel<TeamModel>;
  actual: Team;
}

interface AssertTeamListParams {
  expected: MockedModel<TeamModel>[];
  actual: Team[];
}

interface AssertTeamDTOParams {
  expected: TeamDTO;
  actual: Team;
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
  const { _id, tutorial, students, teamNo } = expected;
  const { id, tutorial: actualTutorial, students: actualStudents, teamNo: actualTeamNo } = actual;

  expect(id).toEqual(_id);
  expect(actualTutorial).toEqual(tutorial._id);
  expect(actualTeamNo).toEqual(teamNo);

  expect(actualStudents.map(s => s.id)).toEqual(students.map(s => s._id));

  actualStudents.forEach(student => {
    expect(student.team?.id).toEqual(_id);
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

  for (let i = 0; i < actual.length; i++) {
    assertTeam({ expected: expected[i], actual: actual[i] });
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
  expect(actualStudents.map(s => s.id)).toEqual(students);

  actualStudents.forEach(student => {
    expect(student.team?.id).toEqual(id);
  });
}

describe('TeamService', () => {
  const TUTORIAL_OF_ALL_TEAMS = TUTORIAL_DOCUMENTS[0];

  let testModule: TestingModule;
  let service: TeamService;

  beforeAll(async () => {
    testModule = await Test.createTestingModule({
      imports: [TestModule.forRootAsync()],
      providers: [TeamService, TutorialService, StudentService, UserService, SheetService],
    }).compile();
  });

  afterAll(async () => {
    await testModule.close();
  });

  beforeEach(async () => {
    await testModule.get<TestModule>(TestModule).reset();

    service = testModule.get<TeamService>(TeamService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('find all teams in tutorial', async () => {
    const teams = await service.findAllTeamsInTutorial(TUTORIAL_OF_ALL_TEAMS._id);

    assertTeamList({ expected: TEAM_DOCUMENTS, actual: teams });
  });

  it('find specific team', async () => {
    const expected = TEAM_DOCUMENTS[0];
    const team = await service.findById({
      tutorialId: TUTORIAL_OF_ALL_TEAMS._id,
      teamId: expected._id,
    });

    assertTeam({ expected, actual: team.toDTO() });
  });

  it('fail on finding non-existing team', async () => {
    const nonExisting = generateObjectId();

    await expect(
      service.findById({ tutorialId: TUTORIAL_OF_ALL_TEAMS._id, teamId: nonExisting })
    ).rejects.toThrow(NotFoundException);
  });

  it('create a new team without students', async () => {
    const dto: TeamDTO = {
      students: [],
    };

    const team = await service.createTeamInTutorial(TUTORIAL_OF_ALL_TEAMS._id, dto);

    assertTeamDTO({ expected: dto, actual: team });
  });

  it('create a new team with students', async () => {
    const dto: TeamDTO = {
      students: [STUDENT_DOCUMENTS[0]._id, STUDENT_DOCUMENTS[1]._id],
    };

    const team = await service.createTeamInTutorial(TUTORIAL_OF_ALL_TEAMS._id, dto);

    assertTeamDTO({ expected: dto, actual: team });
  });

  it('fail on creating team inside non-exisiting tutorial', async () => {
    const nonExisting = generateObjectId();
    const dto: TeamDTO = {
      students: [STUDENT_DOCUMENTS[0]._id, STUDENT_DOCUMENTS[1]._id],
    };

    await expect(service.createTeamInTutorial(nonExisting, dto)).rejects.toThrow(NotFoundException);
  });

  it('fail on creating team with non-existing student', async () => {
    const nonExisting = generateObjectId();
    const dto: TeamDTO = {
      students: [nonExisting, STUDENT_DOCUMENTS[0]._id],
    };

    await expect(service.createTeamInTutorial(TUTORIAL_OF_ALL_TEAMS._id, dto)).rejects.toThrow(
      NotFoundException
    );
  });

  it('fail on creating team with students which are in different tutorials', async () => {
    const dto: TeamDTO = {
      students: [STUDENT_DOCUMENTS[0]._id, STUDENT_DOCUMENTS[3]._id],
    };

    await expect(service.createTeamInTutorial(TUTORIAL_OF_ALL_TEAMS._id, dto)).rejects.toThrow(
      BadRequestException
    );
  });

  it('update a team', async () => {
    const updateDTO: TeamDTO = {
      students: [STUDENT_DOCUMENTS[0]._id, STUDENT_DOCUMENTS[1]._id],
    };
    const createDTO: TeamDTO = {
      students: [STUDENT_DOCUMENTS[2]._id, STUDENT_DOCUMENTS[1]._id],
    };

    const oldTeam = await service.createTeamInTutorial(TUTORIAL_OF_ALL_TEAMS._id, createDTO);
    const updated = await service.updateTeamInTutorial(
      { tutorialId: TUTORIAL_OF_ALL_TEAMS._id, teamId: oldTeam.id },
      updateDTO
    );

    assertTeamDTO({ expected: updateDTO, actual: updated });
  });

  it('fail on updating a team inside a non-existing tutorial', async () => {
    const updateDTO: TeamDTO = {
      students: [STUDENT_DOCUMENTS[0]._id, STUDENT_DOCUMENTS[1]._id],
    };
    const createDTO: TeamDTO = {
      students: [STUDENT_DOCUMENTS[2]._id, STUDENT_DOCUMENTS[1]._id],
    };
    const nonExisting = generateObjectId();

    const oldTeam = await service.createTeamInTutorial(TUTORIAL_OF_ALL_TEAMS._id, createDTO);

    await expect(
      service.updateTeamInTutorial({ tutorialId: nonExisting, teamId: oldTeam.id }, updateDTO)
    ).rejects.toThrow(NotFoundException);
  });

  it('fail on updating a team with non-existing student', async () => {
    const nonExisting = generateObjectId();
    const updateDTO: TeamDTO = {
      students: [nonExisting, STUDENT_DOCUMENTS[1]._id],
    };
    const createDTO: TeamDTO = {
      students: [STUDENT_DOCUMENTS[2]._id, STUDENT_DOCUMENTS[1]._id],
    };

    const oldTeam = await service.createTeamInTutorial(TUTORIAL_OF_ALL_TEAMS._id, createDTO);

    await expect(
      service.updateTeamInTutorial(
        { tutorialId: TUTORIAL_OF_ALL_TEAMS._id, teamId: oldTeam.id },
        updateDTO
      )
    ).rejects.toThrow(NotFoundException);
  });

  it('fail on updating a team with students in different tutorials', async () => {
    const updateDTO: TeamDTO = {
      students: [STUDENT_DOCUMENTS[0]._id, STUDENT_DOCUMENTS[3]._id],
    };
    const createDTO: TeamDTO = {
      students: [STUDENT_DOCUMENTS[2]._id, STUDENT_DOCUMENTS[1]._id],
    };

    const team = await service.createTeamInTutorial(TUTORIAL_OF_ALL_TEAMS._id, createDTO);
    await expect(
      service.updateTeamInTutorial(
        { tutorialId: TUTORIAL_OF_ALL_TEAMS._id, teamId: team.id },
        updateDTO
      )
    ).rejects.toThrow(BadRequestException);
  });

  it('delete a team', async () => {
    const dto: TeamDTO = {
      students: [STUDENT_DOCUMENTS[0]._id, STUDENT_DOCUMENTS[1]._id],
    };

    const team = await service.createTeamInTutorial(TUTORIAL_OF_ALL_TEAMS._id, dto);
    const teamId: TeamID = { tutorialId: TUTORIAL_OF_ALL_TEAMS._id, teamId: team.id };
    const deletedTeam = await service.deleteTeamFromTutorial(teamId);

    expect(deletedTeam.id).toEqual(team.id);
    await expect(service.findById(teamId)).rejects.toThrow(NotFoundException);
  });

  it('fail on deleting a non-existing team', async () => {
    const nonExisting = generateObjectId();
    await expect(
      service.deleteTeamFromTutorial({ tutorialId: TUTORIAL_OF_ALL_TEAMS._id, teamId: nonExisting })
    ).rejects.toThrow(NotFoundException);
  });

  it('fail on deleting a team inside non-existing tutorial', async () => {
    const nonExisting = generateObjectId();
    await expect(
      service.deleteTeamFromTutorial({ tutorialId: nonExisting, teamId: TEAM_DOCUMENTS[0]._id })
    ).rejects.toThrow(NotFoundException);
  });

  it('set grading of a complete team (without students have a grading)', async () => {
    const sheetService = testModule.get<SheetService>(SheetService);
    const team = TEAM_DOCUMENTS[0];
    const teamId = { tutorialId: team.tutorial._id, teamId: team._id };
    const sheetDTO: SheetDTO = {
      sheetNo: 42,
      bonusSheet: false,
      exercises: [
        {
          exName: '1',
          maxPoints: 10,
          bonus: false,
        },
        {
          exName: '2',
          bonus: false,
          maxPoints: 0,
          subexercises: [
            {
              exName: '(a)',
              maxPoints: 5,
              bonus: false,
            },
            {
              exName: '(b)',
              maxPoints: 7,
              bonus: false,
            },
          ],
        },
      ],
    };

    const sheet = await sheetService.create(sheetDTO);
    const gradingDTO: GradingDTO = {
      sheetId: sheet.id,
      exerciseGradings: [
        [
          sheet.exercises[0].id,
          { comment: 'Comment for exercise 1', additionalPoints: 0, points: 8 },
        ],
        [
          sheet.exercises[1].id,
          {
            comment: 'Comment for exercise 2',
            additionalPoints: 0,
            subExercisePoints: [
              [sheet.exercises[1].subexercises[0].id, 4],
              [sheet.exercises[1].subexercises[1].id, 5],
            ],
          },
        ],
      ],
      additionalPoints: 0,
      comment: 'This is a comment for the grading',
    };

    await service.setGrading(teamId, gradingDTO);
    const updatedTeam = await service.findById(teamId);

    for (const student of updatedTeam.students) {
      const [, actualGrading] = student.toDTO().gradings.find(([key]) => key === sheet.id) ?? [];

      assertGrading({ expected: gradingDTO, actual: actualGrading });
    }
  });

  it.todo('set grading of a complete team (with ONE student have a grading)');

  it.todo('set grading of a complete team (with ALL student have a grading)');
});
