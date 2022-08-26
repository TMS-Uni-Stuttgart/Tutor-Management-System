import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DateTime } from 'luxon';
import { generateObjectId } from '../../../test/helpers/test.helpers';
import { TestModule } from '../../../test/helpers/test.module';
import { MockedModel } from '../../../test/helpers/testdocument';
import {
    SHEET_DOCUMENTS,
    STUDENT_DOCUMENTS,
    TEAM_DOCUMENTS,
    TUTORIAL_DOCUMENTS,
} from '../../../test/mocks/documents.mock';
import { ExerciseGrading, Grading } from '../../database/models/grading.model';
import { StudentModel } from '../../database/models/student.model';
import { AttendanceState } from 'shared/model/Attendance';
import { IGrading } from 'shared/model/Gradings';
import { IStudent, StudentStatus } from 'shared/model/Student';
import { ScheinexamDTO } from '../scheinexam/scheinexam.dto';
import { ScheinexamService } from '../scheinexam/scheinexam.service';
import { SheetDTO } from '../sheet/sheet.dto';
import { SheetService } from '../sheet/sheet.service';
import { ShortTestService } from '../short-test/short-test.service';
import { TeamService } from '../team/team.service';
import { TutorialService } from '../tutorial/tutorial.service';
import { UserService } from '../user/user.service';
import { GradingService } from './grading.service';
import {
    AttendanceDTO,
    CakeCountDTO,
    GradingDTO,
    PresentationPointsDTO,
    StudentDTO,
} from './student.dto';
import { StudentService } from './student.service';

interface AssertStudentParams {
    expected: MockedModel<StudentModel>;
    actual: IStudent;
}

interface AssertStudentListParams {
    expected: MockedModel<StudentModel>[];
    actual: IStudent[];
}

interface AssertStudentDTOParams {
    expected: StudentDTO;
    actual: IStudent;
    oldStudent?: IStudent;
}

interface AssertGradingParams {
    expected: GradingDTO;
    actual: IGrading | undefined;
}

/**
 * Checks if the given student representations are considered equal.
 *
 * Equality is defined as:
 * - The actual `id` matches the expected `_id`.
 * - The actual `tutorial` has the correct `id` and `slot`.
 * - After they are converted back to maps the actual representations of the maps are equal to the expected maps.
 * - All other properties of the actual representation match the properties in the expected one.
 *
 * @param params Must contain an expected StudentDocuemt and the actual Student object.
 */
function assertStudent({ expected, actual }: AssertStudentParams) {
    const { _id, attendances, tutorial, presentationPoints, team, ...restExpected } = expected;
    const {
        id: actualId,
        attendances: actualAttendances,
        gradings: actualGradings,
        tutorial: actualTutorial,
        presentationPoints: actualPresentationPoints,
        team: actualTeam,
        ...restActual
    } = actual;

    expect(actualId).toEqual(_id.toString());

    expect(actualTutorial.id).toEqual(tutorial.id);
    expect(actualTutorial.slot).toEqual(tutorial.slot);

    expect(actualTeam?.id).toEqual(team?._id);
    expect(actualTeam?.teamNo).toEqual(team?.teamNo);

    expect(new Map(actualAttendances)).toEqual(attendances);
    expect(new Map(presentationPoints)).toEqual(presentationPoints);

    expect(restActual).toEqual(restExpected);
}

/**
 * Checks if the given actual list of students is equal to the expected one.
 *
 * Equality is defined as:
 * - All actual students are "equal" to their corresponding expected part. Equality is defined by `assertStudent()`.
 * - Both list are in the same order.
 *
 * @param params Must contain a list of expected StudentDocuments and the actual list of Students.
 */
function assertStudentList({ expected, actual }: AssertStudentListParams) {
    expect(actual.length).toBe(expected.length);

    for (let i = 0; i < actual.length; i++) {
        assertStudent({ expected: expected[i], actual: actual[i] });
    }
}

/**
 * Compares the given actual student with the expected one.
 *
 * If an old version is provided it's `gradings`, `attendances` and `cakeCount` are being used. Else this function will assert that `gradings` and `attendances` are empty and `cakeCount` is 0.
 *
 * All other properties are just being compared with the follwing two exceptions:
 * - `id` must only be defined and is not compared to an expected value.
 * - For the `tutorial` only the `id` property gets asserted to match the expected tutorial.
 *
 * @param params Must contain the expected StudentDocument and the actual Student. Can also include the old version of the Student.
 */
function assertStudentDTO({ expected, actual, oldStudent }: AssertStudentDTOParams) {
    const { tutorial, team, ...restExpected } = expected;
    const {
        id,
        attendances,
        gradings,
        tutorial: actualTutorial,
        presentationPoints,
        cakeCount,
        team: actualTeam,
        ...restActual
    } = actual;

    expect(id).toBeDefined();
    expect(restActual).toEqual(restExpected);

    expect(actualTutorial.id).toEqual(tutorial);
    expect(actualTeam?.id).toEqual(team);

    if (!!oldStudent) {
        expect(attendances).toEqual(oldStudent.attendances);
        expect(gradings).toEqual(oldStudent.gradings);
        expect(cakeCount).toEqual(oldStudent.cakeCount);
        expect(presentationPoints).toEqual(oldStudent.presentationPoints);
    } else {
        expect(attendances).toEqual([]);
        expect(gradings).toEqual([]);
        expect(presentationPoints).toEqual([]);
        expect(cakeCount).toBe(0);
    }
}

export function assertGrading({ expected, actual }: AssertGradingParams): void {
    expect(actual).toBeDefined();

    if (!actual) {
        return;
    }

    const expectedDoc = Grading.fromDTO(expected);
    const expectedSum = expectedDoc.points;

    expect(actual.points).toBe(expectedSum);

    expect(actual.exerciseGradings.length).toBe(expected.exerciseGradings.length);

    for (let i = 0; i < expected.exerciseGradings.length; i++) {
        const [expectedKey, expectedEx] = expected.exerciseGradings[i];
        const [actualKey, actualEx] = actual.exerciseGradings[i];
        const expectedDoc = ExerciseGrading.fromDTO(expectedEx);

        expect(actualKey).toEqual(expectedKey);
        expect(actualEx.points).toEqual(expectedDoc.points);
        expect(actualEx.comment).toEqual(expectedEx.comment);
        expect(actualEx.additionalPoints).toEqual(expectedEx.additionalPoints);
    }
}

describe('StudentService', () => {
    let testModule: TestingModule;
    let service: StudentService;

    beforeAll(async () => {
        testModule = await Test.createTestingModule({
            imports: [await TestModule.forRootAsync()],
            providers: [
                StudentService,
                TutorialService,
                TeamService,
                UserService,
                SheetService,
                ScheinexamService,
                ShortTestService,
                GradingService,
            ],
        }).compile();
    });

    afterAll(async () => {
        await testModule.close();
    });

    beforeEach(async () => {
        await testModule.get<TestModule>(TestModule).reset();

        service = testModule.get<StudentService>(StudentService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('find all students', async () => {
        const students = await service.findAll();

        assertStudentList({
            expected: STUDENT_DOCUMENTS,
            actual: students.map((student) => student.toDTO()),
        });
    });

    it('create a student without a team', async () => {
        const expectedTutorial = TUTORIAL_DOCUMENTS[0];

        const dto: StudentDTO = new StudentDTO({
            firstname: 'Ginny',
            lastname: 'Weasley',
            iliasName: 'GinnyWeasley',
            status: StudentStatus.ACTIVE,
            tutorial: expectedTutorial._id,
            courseOfStudies: 'Computer science B. Sc.',
            email: 'weasley_ginny@hogwarts.com',
            matriculationNo: '4567123',
            team: undefined,
        });

        const created = await service.create(dto);

        assertStudentDTO({ expected: dto, actual: created });
    });

    it('create a student with a team', async () => {
        const team = TEAM_DOCUMENTS[0];
        const dto: StudentDTO = {
            firstname: 'Ginny',
            lastname: 'Weasley',
            iliasName: 'GinnyWeasley',
            status: StudentStatus.ACTIVE,
            tutorial: team.tutorial._id,
            courseOfStudies: 'Computer science B. Sc.',
            email: 'weasley_ginny@hogwarts.com',
            matriculationNo: '4567123',
            team: team._id,
        };

        const student = await service.create(dto);

        assertStudentDTO({ expected: dto, actual: student });
    });

    it('fail on creating a student in non-existing tutorial', async () => {
        const nonExistingTutorialId = generateObjectId();

        const dto: StudentDTO = new StudentDTO({
            firstname: 'Ginny',
            lastname: 'Weasley',
            iliasName: 'GinnyWeasley',
            status: StudentStatus.ACTIVE,
            tutorial: nonExistingTutorialId,
            courseOfStudies: 'Computer science B. Sc.',
            email: 'weasley_ginny@hogwarts.com',
            matriculationNo: '4567123',
            team: undefined,
        });

        await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('get a student with a specific ID', async () => {
        const expected = STUDENT_DOCUMENTS[0];
        const actual = await service.findById(expected._id);

        assertStudent({ expected, actual: actual.toDTO() });
    });

    it('fail on getting a non-existing student', async () => {
        const nonExisting = generateObjectId();

        await expect(service.findById(nonExisting)).rejects.toThrow(NotFoundException);
    });

    it('update student with basic information', async () => {
        const expectedTutorial = TUTORIAL_DOCUMENTS[0];
        const updateDTO: StudentDTO = {
            firstname: 'Ginny',
            lastname: 'Weasley',
            iliasName: 'GinnyWeasley',
            status: StudentStatus.ACTIVE,
            tutorial: expectedTutorial._id,
            courseOfStudies: 'Computer science B. Sc.',
            email: 'weasley_ginny@hogwarts.com',
            matriculationNo: '4567123',
            team: undefined,
        };
        const createDTO: StudentDTO = {
            firstname: 'Harry',
            lastname: 'Potter',
            iliasName: 'HarryPotter',
            status: StudentStatus.INACTIVE,
            tutorial: expectedTutorial._id,
            courseOfStudies: 'Data science',
            email: 'potter_harry@hogwarts.com',
            matriculationNo: '5678912',
            team: undefined,
        };

        const oldStudent = await service.create(createDTO);
        const updatedStudent = await service.update(oldStudent.id, updateDTO);

        assertStudentDTO({
            expected: updateDTO,
            actual: updatedStudent,
            oldStudent,
        });
    });

    it('update student with new tutorial', async () => {
        const expectedTutorial = TUTORIAL_DOCUMENTS[0];
        const otherTutorial = TUTORIAL_DOCUMENTS[1];

        const updateDTO: StudentDTO = {
            firstname: 'Ginny',
            lastname: 'Weasley',
            iliasName: 'GinnyWeasley',
            status: StudentStatus.ACTIVE,
            tutorial: expectedTutorial._id,
            courseOfStudies: 'Computer science B. Sc.',
            email: 'weasley_ginny@hogwarts.com',
            matriculationNo: '4567123',
            team: undefined,
        };
        const createDTO: StudentDTO = {
            ...updateDTO,
            tutorial: otherTutorial._id,
        };

        const oldStudent = await service.create(createDTO);
        const updatedStudent = await service.update(oldStudent.id, updateDTO);

        assertStudentDTO({
            expected: updateDTO,
            actual: updatedStudent,
            oldStudent,
        });
    });

    it('update a student by changing its team', async () => {
        const prevTeam = TEAM_DOCUMENTS[0];
        const updatedTeam = TEAM_DOCUMENTS[1];

        // Sanity check
        expect(prevTeam.tutorial._id).toEqual(updatedTeam.tutorial._id);

        const updateDTO: StudentDTO = {
            firstname: 'Ginny',
            lastname: 'Weasley',
            iliasName: 'GinnyWeasley',
            status: StudentStatus.ACTIVE,
            tutorial: updatedTeam.tutorial._id,
            courseOfStudies: 'Computer science B. Sc.',
            email: 'weasley_ginny@hogwarts.com',
            matriculationNo: '4567123',
            team: updatedTeam._id,
        };
        const createDTO: StudentDTO = {
            ...updateDTO,
            team: prevTeam._id,
        };

        const oldStudent = await service.create(createDTO);
        const updatedStudent = await service.update(oldStudent.id, updateDTO);

        assertStudentDTO({
            expected: updateDTO,
            actual: updatedStudent,
            oldStudent,
        });
    });

    it('update a student by removing its team', async () => {
        const prevTeam = TEAM_DOCUMENTS[0];

        const updateDTO: StudentDTO = {
            firstname: 'Ginny',
            lastname: 'Weasley',
            iliasName: 'GinnyWeasley',
            status: StudentStatus.ACTIVE,
            tutorial: prevTeam.tutorial._id,
            courseOfStudies: 'Computer science B. Sc.',
            email: 'weasley_ginny@hogwarts.com',
            matriculationNo: '4567123',
            team: undefined,
        };
        const createDTO: StudentDTO = {
            ...updateDTO,
            team: prevTeam._id,
        };

        const oldStudent = await service.create(createDTO);
        const updatedStudent = await service.update(oldStudent.id, updateDTO);

        assertStudentDTO({
            expected: updateDTO,
            actual: updatedStudent,
            oldStudent,
        });
    });

    it('fail on updating a non-existing student', async () => {
        const nonExisting = generateObjectId();
        const updateDTO: StudentDTO = {
            firstname: 'Ginny',
            lastname: 'Weasley',
            iliasName: 'GinnyWeasley',
            status: StudentStatus.ACTIVE,
            tutorial: TUTORIAL_DOCUMENTS[0]._id,
            courseOfStudies: 'Computer science B. Sc.',
            email: 'weasley_ginny@hogwarts.com',
            matriculationNo: '4567123',
            team: undefined,
        };

        await expect(service.update(nonExisting, updateDTO)).rejects.toThrow(NotFoundException);
    });

    it('fail on updating a student with non-existing tutorial', async () => {
        const expectedTutorial = TUTORIAL_DOCUMENTS[0];
        const nonExisting = generateObjectId();

        const updateDTO: StudentDTO = {
            firstname: 'Ginny',
            lastname: 'Weasley',
            iliasName: 'GinnyWeasley',
            status: StudentStatus.ACTIVE,
            tutorial: nonExisting,
            courseOfStudies: 'Computer science B. Sc.',
            email: 'weasley_ginny@hogwarts.com',
            matriculationNo: '4567123',
            team: undefined,
        };
        const createDTO: StudentDTO = {
            ...updateDTO,
            tutorial: expectedTutorial._id,
        };

        const oldStudent = await service.create(createDTO);

        await expect(service.update(oldStudent.id, updateDTO)).rejects.toThrow(NotFoundException);
    });

    it('delete a student', async () => {
        const expectedTutorial = TUTORIAL_DOCUMENTS[0];
        const dto: StudentDTO = {
            firstname: 'Ginny',
            lastname: 'Weasley',
            iliasName: 'GinnyWeasley',
            status: StudentStatus.ACTIVE,
            tutorial: expectedTutorial._id,
            courseOfStudies: 'Computer science B. Sc.',
            email: 'weasley_ginny@hogwarts.com',
            matriculationNo: '4567123',
            team: undefined,
        };

        const student = await service.create(dto);
        const deletedStudent = await service.delete(student.id);

        expect(deletedStudent.id).toEqual(student.id);
        await expect(service.findById(student.id)).rejects.toThrow(NotFoundException);
    });

    it('fail on deleting a non-existing student', async () => {
        const nonExisting = generateObjectId();

        await expect(service.delete(nonExisting)).rejects.toThrow(NotFoundException);
    });

    it('set the attendance of a student without note', async () => {
        const student = STUDENT_DOCUMENTS[0];
        const attendance: AttendanceDTO = {
            date: '2020-03-01',
            note: undefined,
            state: AttendanceState.PRESENT,
        };

        await service.setAttendance(student._id, attendance);
        const updatedStudent = (await service.findById(student._id)).toDTO();

        expect(updatedStudent.attendances).toEqual([['2020-03-01', attendance]]);
    });

    it('set the attendance of a student with note', async () => {
        const student = STUDENT_DOCUMENTS[0];
        const attendance: AttendanceDTO = {
            date: '2020-03-02',
            note: 'Some note',
            state: AttendanceState.PRESENT,
        };

        await service.setAttendance(student._id, attendance);
        const updatedStudent = (await service.findById(student._id)).toDTO();

        expect(updatedStudent.attendances).toEqual([['2020-03-01', attendance]]);
    });

    it('set the presentation points of a student', async () => {
        const sheet = SHEET_DOCUMENTS[0];
        const student = STUDENT_DOCUMENTS[0];
        const dto: PresentationPointsDTO = {
            points: 6,
            sheetId: sheet._id,
        };

        await service.setPresentationPoints(student._id, dto);
        const updatedStudent = (await service.findById(student._id)).toDTO();

        expect(updatedStudent.presentationPoints).toEqual([[sheet._id, dto.points]]);
    });

    it('set a grading of a sheet of a student', async () => {
        const sheetService = testModule.get<SheetService>(SheetService);
        const student = STUDENT_DOCUMENTS[0];
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
            createNewGrading: true,
            exerciseGradings: [
                [
                    sheet.exercises[0].id,
                    {
                        comment: 'Comment for exercise 1',
                        additionalPoints: 0,
                        points: 8,
                    },
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

        await service.setGrading(student._id, gradingDTO);

        const updatedStudent = (await service.findById(student._id)).toDTO();
        const [, actualGrading] = updatedStudent.gradings.find(([key]) => key === sheet.id) ?? [];

        assertGrading({ expected: gradingDTO, actual: actualGrading });
    });

    it('set a grading of a sheet with one points prop of 0 of a student', async () => {
        const sheetService = testModule.get<SheetService>(SheetService);
        const student = STUDENT_DOCUMENTS[0];
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
            createNewGrading: true,
            exerciseGradings: [
                [
                    sheet.exercises[0].id,
                    {
                        comment: 'Comment for exercise 1',
                        additionalPoints: 0,
                        points: 0,
                    },
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

        await service.setGrading(student._id, gradingDTO);

        const updatedStudent = (await service.findById(student._id)).toDTO();
        const [, actualGrading] = updatedStudent.gradings.find(([key]) => key === sheet.id) ?? [];

        assertGrading({ expected: gradingDTO, actual: actualGrading });
    });

    it('set a grading of an exam of a student', async () => {
        const scheinexamService = testModule.get<ScheinexamService>(ScheinexamService);
        const student = STUDENT_DOCUMENTS[0];
        const scheinexamDTO: ScheinexamDTO = {
            scheinExamNo: 17,
            percentageNeeded: 0.5,
            date: DateTime.fromISO('2020-02-08').toISODate() ?? 'DATE_NOTE_PARSEABLE',
            exercises: [
                {
                    exName: '1',
                    maxPoints: 30,
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

        const scheinexam = await scheinexamService.create(scheinexamDTO);
        const gradingDTO: GradingDTO = {
            examId: scheinexam.id,
            createNewGrading: true,
            exerciseGradings: [
                [
                    scheinexam.exercises[0].id,
                    {
                        comment: 'Comment for exercise 1',
                        additionalPoints: 0,
                        points: 8,
                    },
                ],
                [
                    scheinexam.exercises[1].id,
                    {
                        comment: 'Comment for exercise 2',
                        additionalPoints: 0,
                        subExercisePoints: [
                            [scheinexam.exercises[1].subexercises[0].id, 4],
                            [scheinexam.exercises[1].subexercises[1].id, 5],
                        ],
                    },
                ],
            ],
            additionalPoints: 0,
            comment: 'This is a comment for the grading',
        };

        await service.setGrading(student._id, gradingDTO);

        const updatedStudent = (await service.findById(student._id)).toDTO();
        const [, actualGrading] =
            updatedStudent.gradings.find(([key]) => key === scheinexam.id) ?? [];

        assertGrading({ expected: gradingDTO, actual: actualGrading });
    });

    it('change cakecount of a student', async () => {
        const expectedTutorial = TUTORIAL_DOCUMENTS[0];
        const dto: StudentDTO = {
            firstname: 'Ginny',
            lastname: 'Weasley',
            iliasName: 'GinnyWeasley',
            status: StudentStatus.ACTIVE,
            tutorial: expectedTutorial._id,
            courseOfStudies: 'Computer science B. Sc.',
            email: 'weasley_ginny@hogwarts.com',
            matriculationNo: '4567123',
            team: undefined,
        };
        const cakeCountDTO: CakeCountDTO = {
            cakeCount: 5,
        };

        const student = await service.create(dto);

        await service.setCakeCount(student.id, cakeCountDTO);
        const updatedStudent = await service.findById(student.id);

        expect(updatedStudent.cakeCount).toBe(cakeCountDTO.cakeCount);
    });
});
