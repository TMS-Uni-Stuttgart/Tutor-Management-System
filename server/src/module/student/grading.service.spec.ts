import { TestSuite } from '../../../test/helpers/TestSuite';
import { GradingService } from './grading.service';
import { MOCKED_STUDENTS, MOCKED_TEAMS } from '../../../test/mocks/entities.mock';
import { SheetService } from '../sheet/sheet.service';
import { GradingDTO } from './student.dto';
import { ScheinexamService } from '../scheinexam/scheinexam.service';
import { ScheinexamDTO } from '../scheinexam/scheinexam.dto';
import { DateTime } from 'luxon';
import { Sheet } from '../../database/entities/sheet.entity';
import { SheetDTO } from '../sheet/sheet.dto';
import { Grading } from '../../database/entities/grading.entity';
import { HandIn } from '../../database/entities/ratedEntity.entity';
import { Student } from '../../database/entities/student.entity';

interface AssertGradingParams {
    expected: Grading;
    actual: Grading | undefined;
}

interface AssertGradingFromDTOParams {
    expected: GradingDTO;
    actual: Grading | undefined;
    handIn: HandIn;
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

function assertGrading({ expected, actual }: AssertGradingParams): void {
    expect(actual).toBeDefined();

    if (!actual) {
        return;
    }

    const expectedSum = expected.points;

    expect(actual.points).toBe(expectedSum);

    expect(actual.exerciseGradings.length).toBe(expected.exerciseGradings.length);

    for (let i = 0; i < expected.exerciseGradings.length; i++) {
        const exerciseGrading = expected.exerciseGradings[i];
        const actualGrading = actual.exerciseGradings[i];

        expect(actualGrading.exerciseId).toEqual(exerciseGrading.exerciseId);
        expect(actualGrading.points).toEqual(exerciseGrading.points);
        expect(actualGrading.comment).toEqual(exerciseGrading.comment);
        expect(actualGrading.additionalPoints).toEqual(exerciseGrading.additionalPoints);
    }
}

function assertGradingFromDTO({ expected, actual, handIn }: AssertGradingFromDTOParams): void {
    const expectedGrading = new Grading({ handIn });
    expectedGrading.updateFromDTO({ dto: expected, handIn });

    assertGrading({ expected: expectedGrading, actual });
}

describe('GradingService', () => {
    const suite = new TestSuite(GradingService);

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

        await suite.service.setOfStudent(student, gradingDTO);
        const actualGrading = await suite.service.findOfStudentAndHandIn(student.id, sheet.id);

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

        await suite.service.setOfStudent(student, gradingDTO);
        const actualGrading = await suite.service.findOfStudentAndHandIn(student.id, sheet.id);

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

        await suite.service.setOfStudent(student, gradingDTO);
        const actualGrading = await suite.service.findOfStudentAndHandIn(student.id, scheinexam.id);

        assertGradingFromDTO({
            expected: gradingDTO,
            actual: actualGrading,
            handIn: scheinexam,
        });
    });

    it('set grading of a complete team (without students have a grading)', async () => {
        const sheetService = suite.getService(SheetService);
        const team = MOCKED_TEAMS[0];
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
        const sheet = await sheetService.findById(sheetId);
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

        const gradingMap = new Map<Student, GradingDTO>();

        for (const student of team.students) {
            gradingMap.set(student, gradingDTO);
        }

        await suite.service.setOfMultipleStudents(gradingMap);
        const actualGradings = await suite.service.findOfMultipleStudents(
            team.getStudents().map((student) => student.id)
        );

        for (const student of team.students) {
            const actualGrading = actualGradings.getGradingForHandIn(student.id, sheet);

            assertGradingFromDTO({
                expected: gradingDTO,
                actual: actualGrading,
                handIn: sheet,
            });
        }
    });

    it.todo('set grading of a complete team (with ONE student have a grading)');

    it.todo('set grading of a complete team (with ALL student have a grading)');
});
