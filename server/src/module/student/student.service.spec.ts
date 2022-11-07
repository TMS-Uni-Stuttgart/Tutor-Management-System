import { NotFoundException } from '@nestjs/common';
import { DateTime } from 'luxon';
import { AttendanceState } from 'shared/model/Attendance';
import { ICreateStudentsDTO, IStudent, IStudentDTO, StudentStatus } from 'shared/model/Student';
import { sortListById } from '../../../test/helpers/test.helpers';
import { TestSuite } from '../../../test/helpers/TestSuite';
import {
    MOCKED_SHEETS,
    MOCKED_STUDENTS,
    MOCKED_TEAMS,
    MOCKED_TUTORIALS,
} from '../../../test/mocks/entities.mock';
import { Student } from '../../database/entities/student.entity';
import {
    AttendanceDTO,
    CakeCountDTO,
    CreateStudentDTO,
    CreateStudentsDTO,
    PresentationPointsDTO,
} from './student.dto';
import { StudentModule } from './student.module';
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
    expected: CreateStudentDTO;
    actual: IStudent;
    oldStudent?: IStudent;
}

interface AssertGeneratedStudentsParams {
    expected: CreateStudentsDTO;
    actual: IStudent[];
}

interface AssertGenerateStudentDTOParams {
    expected: IStudentDTO;
    expectedTutorial: string;
    actual: IStudent;
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
        expect(cakeCount).toEqual(oldStudent.cakeCount);
        expect(presentationPoints).toEqual(oldStudent.presentationPoints);
    } else {
        expect(attendances).toEqual([]);
        expect(presentationPoints).toEqual([]);
        expect(cakeCount).toBe(0);
    }
}

/**
 * Checks if the two given lists match.
 * Requires that each student has a unique matriculation number to define equivalent students.
 *
 * Matching is defined as:
 * - Both lists have the same length.
 * - Each DTO has a corresponding student which got created using it's information.
 *
 * @param expected List containing the DTO holding the information of the students which should have been created.
 * @param actual List of actually generated students.
 */
function assertGeneratedStudents({ expected, actual }: AssertGeneratedStudentsParams) {
    expect(actual.length).toBe(expected.students.length);

    for (const { ...dto } of expected.students) {
        const idx = actual.findIndex((u) => u.matriculationNo === dto.matriculationNo);
        const user = actual[idx];

        expect(idx).not.toBe(-1);
        assertGenerateStudentDTO({
            expected: dto,
            expectedTutorial: expected.tutorial,
            actual: user,
        });
    }
}

/**
 * Compares the given actual student with the expected one.
 *
 * This function will assert that `gradings` and `attendances` are empty and `cakeCount` is 0.
 *
 * All other properties are just being compared with the following two exceptions:
 * - `id` must only be defined and is not compared to an expected value.
 * - For the `tutorial` only the `id` property gets asserted to match the expected tutorial.
 * - The `team` is not compared.
 *
 * @param params Must contain the expected StudentDocument and the actual Student. Can also include the old version of the Student.
 */
function assertGenerateStudentDTO({
    expected,
    actual,
    expectedTutorial,
}: AssertGenerateStudentDTOParams) {
    const { team, ...restExpected } = expected;
    const {
        id,
        attendances,
        tutorial: actualTutorial,
        presentationPoints,
        cakeCount,
        team: actualTeam,
        ...restActual
    } = actual;

    expect(id).toBeDefined();
    expect(restActual).toEqual(restExpected);

    expect(actualTutorial.id).toEqual(expectedTutorial);

    expect(attendances).toEqual([]);
    expect(presentationPoints).toEqual([]);
    expect(cakeCount).toBe(0);
}

describe('StudentService', () => {
    const suite = new TestSuite(StudentService, StudentModule);

    it('find all students', async () => {
        const students = await suite.service.findAll();

        assertStudentList({
            expected: MOCKED_STUDENTS,
            actual: students.map((student) => student.toDTO()),
        });
    });

    it('create a student without a team', async () => {
        const expectedTutorial = MOCKED_TUTORIALS[0];

        const dto: CreateStudentDTO = {
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

        const created = await suite.service.create(dto);

        assertStudentDTO({ expected: dto, actual: created });
    });

    it('create a student with a team', async () => {
        const team = MOCKED_TEAMS[0];
        const dto: CreateStudentDTO = {
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

        const dto: CreateStudentDTO = {
            firstname: 'Ginny',
            lastname: 'Weasley',
            iliasName: 'GinnyWeasley',
            status: StudentStatus.ACTIVE,
            tutorial: nonExistingTutorialId,
            courseOfStudies: 'Computer science B. Sc.',
            email: 'weasley_ginny@hogwarts.com',
            matriculationNo: '4567123',
            team: undefined,
        };

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
        const updateDTO: CreateStudentDTO = {
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
        const createDTO: CreateStudentDTO = {
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

        const updateDTO: CreateStudentDTO = {
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
        const createDTO: CreateStudentDTO = {
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

        const updateDTO: CreateStudentDTO = {
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
        const createDTO: CreateStudentDTO = {
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

        const updateDTO: CreateStudentDTO = {
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
        const createDTO: CreateStudentDTO = {
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
        const updateDTO: CreateStudentDTO = {
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

        const updateDTO: CreateStudentDTO = {
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
        const createDTO: CreateStudentDTO = {
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
        const dto: CreateStudentDTO = {
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

    it('change cakecount of a student', async () => {
        const expectedTutorial = MOCKED_TUTORIALS[0];
        const dto: CreateStudentDTO = {
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

    it('create multiple students without team', async () => {
        const expectedTutorial = MOCKED_TUTORIALS[0];
        const studentsToCreate: CreateStudentsDTO = {
            tutorial: expectedTutorial.id,
            students: [
                {
                    firstname: 'Ginny',
                    lastname: 'Weasley',
                    iliasName: 'GinnyWeasley',
                    status: StudentStatus.ACTIVE,
                    courseOfStudies: 'Computer science B. Sc.',
                    email: 'weasley_ginny@hogwarts.com',
                    matriculationNo: '111111',
                    team: undefined,
                },
                {
                    firstname: 'Harry',
                    lastname: 'Potter',
                    iliasName: 'HarryPotter',
                    status: StudentStatus.INACTIVE,
                    courseOfStudies: 'Data science',
                    email: 'potter_harry@hogwarts.com',
                    matriculationNo: '111112',
                    team: undefined,
                },
            ],
        };

        const created = await suite.service.createMany(studentsToCreate);

        assertGeneratedStudents({ expected: studentsToCreate, actual: created });

        expect(created[0].team).toBe(undefined);
        expect(created[1].team).toBe(undefined);
    });

    it('create multiple students in same new team', async () => {
        const expectedTutorial = MOCKED_TUTORIALS[0];
        const studentsToCreate: CreateStudentsDTO = {
            tutorial: expectedTutorial.id,
            students: [
                {
                    firstname: 'Ginny',
                    lastname: 'Weasley',
                    iliasName: 'GinnyWeasley',
                    status: StudentStatus.ACTIVE,
                    courseOfStudies: 'Computer science B. Sc.',
                    email: 'weasley_ginny@hogwarts.com',
                    matriculationNo: '111111',
                    team: 'a',
                },
                {
                    firstname: 'Harry',
                    lastname: 'Potter',
                    iliasName: 'HarryPotter',
                    status: StudentStatus.INACTIVE,
                    courseOfStudies: 'Data science',
                    email: 'potter_harry@hogwarts.com',
                    matriculationNo: '111112',
                    team: 'a',
                },
            ],
        };

        const created = await suite.service.createMany(studentsToCreate);

        assertGeneratedStudents({ expected: studentsToCreate, actual: created });

        expect(created[0].team).toBeDefined();
        expect(created[0].team?.teamNo).toBe(MOCKED_TEAMS.length + 1);
        expect(created[0].team?.id).toBe(created[1].team?.id);
    });

    it('create multiple students in same different new teams', async () => {
        const expectedTutorial = MOCKED_TUTORIALS[0];
        const studentsToCreate: CreateStudentsDTO = {
            tutorial: expectedTutorial.id,
            students: [
                {
                    firstname: 'Ginny',
                    lastname: 'Weasley',
                    iliasName: 'GinnyWeasley',
                    status: StudentStatus.ACTIVE,
                    courseOfStudies: 'Computer science B. Sc.',
                    email: 'weasley_ginny@hogwarts.com',
                    matriculationNo: '111111',
                    team: 'a',
                },
                {
                    firstname: 'Harry',
                    lastname: 'Potter',
                    iliasName: 'HarryPotter',
                    status: StudentStatus.INACTIVE,
                    courseOfStudies: 'Data science',
                    email: 'potter_harry@hogwarts.com',
                    matriculationNo: '111112',
                    team: 'b',
                },
            ],
        };

        const created = await suite.service.createMany(studentsToCreate);

        assertGeneratedStudents({ expected: studentsToCreate, actual: created });

        expect(created[0].team).toBeDefined();
        expect(created[1].team).toBeDefined();
        expect(created[0].team?.id == created[1].team?.id).toBeFalsy();
    });

    it('create multiple students in same existing team', async () => {
        const expectedTutorial = MOCKED_TUTORIALS[0];
        const expectedTeam = MOCKED_TEAMS[0];
        const studentsToCreate: CreateStudentsDTO = {
            tutorial: expectedTutorial.id,
            students: [
                {
                    firstname: 'Ginny',
                    lastname: 'Weasley',
                    iliasName: 'GinnyWeasley',
                    status: StudentStatus.ACTIVE,
                    courseOfStudies: 'Computer science B. Sc.',
                    email: 'weasley_ginny@hogwarts.com',
                    matriculationNo: '111111',
                    team: expectedTeam.teamNo.toString(),
                },
                {
                    firstname: 'Harry',
                    lastname: 'Potter',
                    iliasName: 'HarryPotter',
                    status: StudentStatus.INACTIVE,
                    courseOfStudies: 'Data science',
                    email: 'potter_harry@hogwarts.com',
                    matriculationNo: '111112',
                    team: expectedTeam.teamNo.toString(),
                },
            ],
        };

        const created = await suite.service.createMany(studentsToCreate);

        assertGeneratedStudents({ expected: studentsToCreate, actual: created });

        expect(created[0].team?.id).toBe(expectedTeam.id);
        expect(created[1].team?.id).toBe(expectedTeam.id);
    });
});
