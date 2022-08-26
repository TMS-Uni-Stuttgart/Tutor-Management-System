import { NotFoundException } from '@nestjs/common';
import { DateTime } from 'luxon';
import { AttendanceState } from 'shared/model/Attendance';
import { IGrading } from 'shared/model/Gradings';
import { IStudent, StudentStatus } from 'shared/model/Student';
import { sortListById } from '../../../test/helpers/test.helpers';
import { TestSuite } from '../../../test/helpers/TestSuite';
import {
    MOCKED_SHEETS,
    MOCKED_STUDENTS,
    MOCKED_TEAMS,
    MOCKED_TUTORIALS,
} from '../../../test/mocks/entities.mock';
import { Grading } from '../../database/entities/grading.entity';
import { HandIn } from '../../database/entities/ratedEntity.entity';
import { Sheet } from '../../database/entities/sheet.entity';
import { Student } from '../../database/entities/student.entity';
import { ScheinexamDTO } from '../scheinexam/scheinexam.dto';
import { ScheinexamService } from '../scheinexam/scheinexam.service';
import { SheetDTO } from '../sheet/sheet.dto';
import { SheetService } from '../sheet/sheet.service';
import {
    AttendanceDTO,
    CakeCountDTO,
    GradingDTO,
    PresentationPointsDTO,
    StudentDTO,
} from './student.dto';
import { StudentService } from './student.service';

interface AssertStudentParams {
    expected: Student;
    actual: IStudent;
}

interface AssertStudentListParams {
    expected: Student[];
    actual: IStudent[];
}

interface AssertStudentDTOParams {
    expected: StudentDTO;
    actual: IStudent;
    oldStudent?: IStudent;
}

interface AssertGradingParams {
    expected: Grading;
    actual: IGrading | undefined;
}

interface AssertGradingFromDTOParams {
    expected: GradingDTO;
    actual: IGrading | undefined;
    handIn: HandIn;
}

function assertStudentBasics({ expected, actual }: AssertStudentParams) {
    expect(actual.firstname).toEqual(expected.firstname);
    expect(actual.lastname).toEqual(expected.lastname);
    expect(actual.matriculationNo).toEqual(expected.matriculationNo);
    expect(actual.status).toEqual(expected.status);
    expect(actual.iliasName).toEqual(expected.iliasName);
    expect(actual.email).toEqual(expected.email);
    expect(actual.courseOfStudies).toEqual(expected.courseOfStudies);
    expect(actual.cakeCount).toEqual(expected.cakeCount);
}

function assertStudentAttendances({ expected, actual }: AssertStudentParams) {
    const attendances = expected.getAllAttendances();
    const actualAttendances = new Map(actual.attendances);

    for (const attendance of attendances) {
        const actualAttendance = actualAttendances.get(attendance.getDateAsKey());

        expect(actualAttendance).toBeDefined();
        expect(actualAttendance?.state).toEqual(attendance.state);
        expect(attendance.isOnDay(DateTime.fromISO(actualAttendance?.date ?? '')));
        expect(actualAttendance?.note).toEqual(attendance.note);
    }
}

function assertStudentPresentationPoints({ expected, actual }: AssertStudentParams) {
    const presentationPoints = expected.getAllPresentationPoints();
    const actualPresentationPoints = new Map(actual.presentationPoints);

    expect(actualPresentationPoints).toEqual(presentationPoints);
}

function assertStudentGradings({ expected, actual }: AssertStudentParams) {
    // TODO: Rewrite me!!!
    // const gradings = expected.gradings.getItems();
    // const actualGradings = new Map(actual.gradings);
    //
    // for (const grading of gradings) {
    //     const handIn = grading.handIn;
    //     assertGrading({
    //         expected: grading,
    //         actual: actualGradings.get(handIn.id),
    //     });
    // }
}

/**
 * Checks if the given student representations are considered equal.
 *
 * Equality is defined as:
 * - The actual `id` matches the expected `id`.
 * - The actual `tutorial` has the correct `id` and `slot`.
 * - After they are converted back to maps the actual representations of the maps are equal to the expected maps.
 * - All other properties of the actual representation match the properties in the expected one.
 *
 * @param params Must contain an expected StudentDocument and the actual Student object.
 */
function assertStudent({ expected, actual }: AssertStudentParams) {
    const { id, tutorial, team } = expected;
    const { id: actualId, tutorial: actualTutorial, team: actualTeam } = actual;

    expect(actualId).toEqual(id);

    assertStudentBasics({ expected, actual });

    expect(actualTutorial.id).toEqual(tutorial.id);
    expect(actualTutorial.slot).toEqual(tutorial.slot);

    expect(actualTeam?.id).toEqual(team?.id);
    expect(actualTeam?.teamNo).toEqual(team?.teamNo);

    assertStudentAttendances({ expected, actual });
    assertStudentPresentationPoints({ expected, actual });
    assertStudentGradings({ expected, actual });
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

    const expectedList = sortListById(expected);
    const actualList = sortListById(actual);

    for (let i = 0; i < actual.length; i++) {
        assertStudent({ expected: expectedList[i], actual: actualList[i] });
    }
}

/**
 * Compares the given actual student with the expected one.
 *
 * If an old version is provided it's `gradings`, `attendances` and `cakeCount` are being used. Else this function will assert that `gradings` and `attendances` are empty and `cakeCount` is 0.
 *
 * All other properties are just being compared with the following two exceptions:
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

    const expectedSum = expected.points;

    expect(actual.points).toBe(expectedSum);

    expect(actual.exerciseGradings.length).toBe(expected.exerciseGradings.length);

    for (let i = 0; i < expected.exerciseGradings.length; i++) {
        const exerciseGrading = expected.exerciseGradings[i];
        const [actualKey, actualEx] = actual.exerciseGradings[i];

        expect(actualKey).toEqual(exerciseGrading.exerciseId);
        expect(actualEx.points).toEqual(exerciseGrading.points);
        expect(actualEx.comment).toEqual(exerciseGrading.comment);
        expect(actualEx.additionalPoints).toEqual(exerciseGrading.additionalPoints);
    }
}

export function assertGradingFromDTO({
    expected,
    actual,
    handIn,
}: AssertGradingFromDTOParams): void {
    const expectedGrading = new Grading({ handIn });
    expectedGrading.updateFromDTO({ dto: expected, handIn });

    assertGrading({ expected: expectedGrading, actual });
}

async function createDummySheet(sheetService: SheetService): Promise<Sheet> {
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

    const sheetId = (await sheetService.create(sheetDTO)).id;
    return sheetService.findById(sheetId);
}

describe('StudentService', () => {
    const suite = new TestSuite(StudentService);

    it('find all students', async () => {
        const students = await suite.service.findAll();

        assertStudentList({
            expected: MOCKED_STUDENTS,
            actual: students.map((student) => student.toDTO()),
        });
    });

    it('create a student without a team', async () => {
        const expectedTutorial = MOCKED_TUTORIALS[0];

        const dto: StudentDTO = new StudentDTO({
            firstname: 'Ginny',
            lastname: 'Weasley',
            iliasName: 'GinnyWeasley',
            status: StudentStatus.ACTIVE,
            tutorial: expectedTutorial.id,
            courseOfStudies: 'Computer science B. Sc.',
            email: 'weasley_ginny@hogwarts.com',
            matriculationNo: '4567123',
            team: undefined,
        });

        const created = await suite.service.create(dto);

        assertStudentDTO({ expected: dto, actual: created });
    });

    it('create a student with a team', async () => {
        const team = MOCKED_TEAMS[0];
        const dto: StudentDTO = {
            firstname: 'Ginny',
            lastname: 'Weasley',
            iliasName: 'GinnyWeasley',
            status: StudentStatus.ACTIVE,
            tutorial: team.tutorial.id,
            courseOfStudies: 'Computer science B. Sc.',
            email: 'weasley_ginny@hogwarts.com',
            matriculationNo: '4567123',
            team: team.id,
        };

        const student = await suite.service.create(dto);

        assertStudentDTO({ expected: dto, actual: student });
    });

    it('fail on creating a student in non-existing tutorial', async () => {
        const nonExistingTutorialId = 'non-existing-id';

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

        await expect(suite.service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('get a student with a specific id', async () => {
        const expected = MOCKED_STUDENTS[0];
        const actual = await suite.service.findById(expected.id);

        assertStudent({ expected, actual: actual.toDTO() });
    });

    it('fail on getting a non-existing student', async () => {
        const nonExisting = 'non-existing-id';

        await expect(suite.service.findById(nonExisting)).rejects.toThrow(NotFoundException);
    });

    it('update student with basic information', async () => {
        const expectedTutorial = MOCKED_TUTORIALS[0];
        const updateDTO: StudentDTO = {
            firstname: 'Ginny',
            lastname: 'Weasley',
            iliasName: 'GinnyWeasley',
            status: StudentStatus.ACTIVE,
            tutorial: expectedTutorial.id,
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
            tutorial: expectedTutorial.id,
            courseOfStudies: 'Data science',
            email: 'potter_harry@hogwarts.com',
            matriculationNo: '5678912',
            team: undefined,
        };

        const oldStudent = await suite.service.create(createDTO);
        const updatedStudent = await suite.service.update(oldStudent.id, updateDTO);

        assertStudentDTO({
            expected: updateDTO,
            actual: updatedStudent,
            oldStudent,
        });
    });

    it('update student with new tutorial', async () => {
        const expectedTutorial = MOCKED_TUTORIALS[0];
        const otherTutorial = MOCKED_TUTORIALS[1];

        const updateDTO: StudentDTO = {
            firstname: 'Ginny',
            lastname: 'Weasley',
            iliasName: 'GinnyWeasley',
            status: StudentStatus.ACTIVE,
            tutorial: expectedTutorial.id,
            courseOfStudies: 'Computer science B. Sc.',
            email: 'weasley_ginny@hogwarts.com',
            matriculationNo: '4567123',
            team: undefined,
        };
        const createDTO: StudentDTO = {
            ...updateDTO,
            tutorial: otherTutorial.id,
        };

        const oldStudent = await suite.service.create(createDTO);
        const updatedStudent = await suite.service.update(oldStudent.id, updateDTO);

        assertStudentDTO({
            expected: updateDTO,
            actual: updatedStudent,
            oldStudent,
        });
    });

    it('update a student by changing its team', async () => {
        const prevTeam = MOCKED_TEAMS[0];
        const updatedTeam = MOCKED_TEAMS[1];

        // Sanity check
        expect(prevTeam.tutorial.id).toEqual(updatedTeam.tutorial.id);

        const updateDTO: StudentDTO = {
            firstname: 'Ginny',
            lastname: 'Weasley',
            iliasName: 'GinnyWeasley',
            status: StudentStatus.ACTIVE,
            tutorial: updatedTeam.tutorial.id,
            courseOfStudies: 'Computer science B. Sc.',
            email: 'weasley_ginny@hogwarts.com',
            matriculationNo: '4567123',
            team: updatedTeam.id,
        };
        const createDTO: StudentDTO = {
            ...updateDTO,
            team: prevTeam.id,
        };

        const oldStudent = await suite.service.create(createDTO);
        const updatedStudent = await suite.service.update(oldStudent.id, updateDTO);

        assertStudentDTO({
            expected: updateDTO,
            actual: updatedStudent,
            oldStudent,
        });
    });

    it('update a student by removing its team', async () => {
        const prevTeam = MOCKED_TEAMS[0];

        const updateDTO: StudentDTO = {
            firstname: 'Ginny',
            lastname: 'Weasley',
            iliasName: 'GinnyWeasley',
            status: StudentStatus.ACTIVE,
            tutorial: prevTeam.tutorial.id,
            courseOfStudies: 'Computer science B. Sc.',
            email: 'weasley_ginny@hogwarts.com',
            matriculationNo: '4567123',
            team: undefined,
        };
        const createDTO: StudentDTO = {
            ...updateDTO,
            team: prevTeam.id,
        };

        const oldStudent = await suite.service.create(createDTO);
        const updatedStudent = await suite.service.update(oldStudent.id, updateDTO);

        assertStudentDTO({
            expected: updateDTO,
            actual: updatedStudent,
            oldStudent,
        });
    });

    it('fail on updating a non-existing student', async () => {
        const nonExisting = 'non-existing-id';
        const updateDTO: StudentDTO = {
            firstname: 'Ginny',
            lastname: 'Weasley',
            iliasName: 'GinnyWeasley',
            status: StudentStatus.ACTIVE,
            tutorial: MOCKED_TUTORIALS[0].id,
            courseOfStudies: 'Computer science B. Sc.',
            email: 'weasley_ginny@hogwarts.com',
            matriculationNo: '4567123',
            team: undefined,
        };

        await expect(suite.service.update(nonExisting, updateDTO)).rejects.toThrow(
            NotFoundException
        );
    });

    it('fail on updating a student with non-existing tutorial', async () => {
        const expectedTutorial = MOCKED_TUTORIALS[0];
        const nonExisting = 'non-existing-id';

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
            tutorial: expectedTutorial.id,
        };

        const oldStudent = await suite.service.create(createDTO);

        await expect(suite.service.update(oldStudent.id, updateDTO)).rejects.toThrow(
            NotFoundException
        );
    });

    it('delete a student', async () => {
        const expectedTutorial = MOCKED_TUTORIALS[0];
        const dto: StudentDTO = {
            firstname: 'Ginny',
            lastname: 'Weasley',
            iliasName: 'GinnyWeasley',
            status: StudentStatus.ACTIVE,
            tutorial: expectedTutorial.id,
            courseOfStudies: 'Computer science B. Sc.',
            email: 'weasley_ginny@hogwarts.com',
            matriculationNo: '4567123',
            team: undefined,
        };

        const student = await suite.service.create(dto);
        await suite.service.delete(student.id);

        await expect(suite.service.findById(student.id)).rejects.toThrow(NotFoundException);
    });

    it('fail on deleting a non-existing student', async () => {
        const nonExisting = 'non-existing-id';

        await expect(suite.service.delete(nonExisting)).rejects.toThrow(NotFoundException);
    });

    it('set the attendance of a student without note', async () => {
        const student = MOCKED_STUDENTS[0];
        const attendance: AttendanceDTO = {
            date: '2020-03-01',
            note: undefined,
            state: AttendanceState.PRESENT,
        };

        await suite.service.setAttendance(student.id, attendance);
        const updatedStudent = (await suite.service.findById(student.id)).toDTO();

        expect(updatedStudent.attendances).toEqual([['2020-03-01', attendance]]);
    });

    it('set the attendance of a student with note', async () => {
        const student = MOCKED_STUDENTS[0];
        const attendance: AttendanceDTO = {
            date: '2020-03-01',
            note: 'Some note',
            state: AttendanceState.PRESENT,
        };

        await suite.service.setAttendance(student.id, attendance);
        const updatedStudent = (await suite.service.findById(student.id)).toDTO();

        expect(updatedStudent.attendances).toEqual([['2020-03-01', attendance]]);
    });

    it('set the presentation points of a student', async () => {
        const sheet = MOCKED_SHEETS[0];
        const student = MOCKED_STUDENTS[0];
        const dto: PresentationPointsDTO = {
            points: 6,
            sheetId: sheet.id,
        };

        await suite.service.setPresentationPoints(student.id, dto);
        const updatedStudent = (await suite.service.findById(student.id)).toDTO();

        expect(updatedStudent.presentationPoints).toEqual([[sheet.id, dto.points]]);
    });

    it('set a grading of a sheet of a student', async () => {
        const student = MOCKED_STUDENTS[0];
        const sheet = await createDummySheet(suite.getService(SheetService));
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

        await suite.service.setGrading(student.id, gradingDTO);

        const updatedStudent = (await suite.service.findById(student.id)).toDTO();
        const [, actualGrading] = updatedStudent.gradings.find(([key]) => key === sheet.id) ?? [];

        assertGradingFromDTO({
            expected: gradingDTO,
            actual: actualGrading,
            handIn: sheet,
        });
    });

    it('set a grading of a sheet with one points prop of 0 of a student', async () => {
        const student = MOCKED_STUDENTS[0];
        const sheet = await createDummySheet(suite.getService(SheetService));
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

        await suite.service.setGrading(student.id, gradingDTO);

        const updatedStudent = (await suite.service.findById(student.id)).toDTO();
        const [, actualGrading] = updatedStudent.gradings.find(([key]) => key === sheet.id) ?? [];

        assertGradingFromDTO({
            expected: gradingDTO,
            actual: actualGrading,
            handIn: sheet,
        });
    });

    it('set a grading of an exam of a student', async () => {
        const scheinexamService = suite.getService(ScheinexamService);
        const student = MOCKED_STUDENTS[0];
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

        const scheinexamId = (await scheinexamService.create(scheinexamDTO)).id;
        const scheinexam = await scheinexamService.findById(scheinexamId);
        const gradingDTO: GradingDTO = {
            examId: scheinexam.id,
            createNewGrading: true,
            exerciseGradings: [
                [
                    scheinexam.exercises[0].id,
                    {
                        comment: 'Comment for scheinexam exercise 1',
                        additionalPoints: 0,
                        points: 8,
                    },
                ],
                [
                    scheinexam.exercises[1].id,
                    {
                        comment: 'Comment for scheinexam exercise 2',
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

        await suite.service.setGrading(student.id, gradingDTO);

        const updatedStudent = (await suite.service.findById(student.id)).toDTO();
        const [, actualGrading] =
            updatedStudent.gradings.find(([key]) => key === scheinexam.id) ?? [];

        assertGradingFromDTO({
            expected: gradingDTO,
            actual: actualGrading,
            handIn: scheinexam,
        });
    });

    it('change cakecount of a student', async () => {
        const expectedTutorial = MOCKED_TUTORIALS[0];
        const dto: StudentDTO = {
            firstname: 'Ginny',
            lastname: 'Weasley',
            iliasName: 'GinnyWeasley',
            status: StudentStatus.ACTIVE,
            tutorial: expectedTutorial.id,
            courseOfStudies: 'Computer science B. Sc.',
            email: 'weasley_ginny@hogwarts.com',
            matriculationNo: '4567123',
            team: undefined,
        };
        const cakeCountDTO: CakeCountDTO = {
            cakeCount: 5,
        };

        const student = await suite.service.create(dto);

        await suite.service.setCakeCount(student.id, cakeCountDTO);
        const updatedStudent = await suite.service.findById(student.id);

        expect(updatedStudent.cakeCount).toBe(cakeCountDTO.cakeCount);
    });
});
