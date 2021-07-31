import { DateTime } from 'luxon';
import { Role } from 'shared/model/Role';
import { ScheincriteriaIdentifier } from 'shared/model/ScheinCriteria';
import { StudentStatus } from 'shared/model/Student';
import { v4 } from 'uuid';
import { Exercise, SubExercise } from '../../src/database/entities/ratedEntity.entity';
import { ScheincriteriaEntity } from '../../src/database/entities/scheincriteria.entity';
import { Scheinexam } from '../../src/database/entities/scheinexam.entity';
import { Setting } from '../../src/database/entities/settings.entity';
import { Sheet } from '../../src/database/entities/sheet.entity';
import { ShortTest } from '../../src/database/entities/shorttest.entity';
import { Student } from '../../src/database/entities/student.entity';
import { Team } from '../../src/database/entities/team.entity';
import { Tutorial } from '../../src/database/entities/tutorial.entity';
import { User } from '../../src/database/entities/user.entity';
import { AttendanceCriteria } from '../../src/module/scheincriteria/container/criterias/AttendanceCriteria';
import { PresentationCriteria } from '../../src/module/scheincriteria/container/criterias/PresentationCriteria';
import { ScheinexamCriteria } from '../../src/module/scheincriteria/container/criterias/ScheinexamCriteria';
import { SheetIndividualCriteria } from '../../src/module/scheincriteria/container/criterias/SheetIndividualCriteria';
import { SheetTotalCriteria } from '../../src/module/scheincriteria/container/criterias/SheetTotalCriteria';
import { ShortTestCriteria } from '../../src/module/scheincriteria/container/criterias/ShortTestCriteria';
import { Scheincriteria } from '../../src/module/scheincriteria/container/Scheincriteria';
import { ScheincriteriaContainer } from '../../src/module/scheincriteria/container/scheincriteria.container';
import { ScheincriteriaConstructor } from '../../src/module/scheincriteria/scheincriteria.module';
import { createDatesForTutorial } from './mock.helpers';

function initCriteriaContainer() {
    const container = ScheincriteriaContainer.getContainer();
    const criterias: ScheincriteriaConstructor[] = [
        AttendanceCriteria,
        PresentationCriteria,
        SheetIndividualCriteria,
        SheetTotalCriteria,
        ScheinexamCriteria,
        ShortTestCriteria,
    ];

    criterias.forEach((criteria) => container.registerBluePrint(criteria));
}

initCriteriaContainer();

export const MOCKED_USERS: User[] = [
    new User({
        firstname: 'Albus',
        lastname: 'Dumbledore',
        email: 'dumbledore@hogwarts.com',
        username: 'dumbleas',
        password: 'albusPassword',
        roles: [Role.ADMIN],
    }),
    new User({
        firstname: 'Harry',
        lastname: 'Potter',
        email: 'harrypotter@hogwarts.com',
        username: 'potterhy',
        password: 'harrysPassword',
        temporaryPassword: 'someTemporaryPassword',
        roles: [Role.TUTOR],
    }),
    new User({
        firstname: 'Ron',
        lastname: 'Weasley',
        email: 'weaslyron@hogwarts.com',
        username: 'weaslern',
        password: 'ronsPassword',
        roles: [Role.TUTOR],
    }),
    new User({
        firstname: 'Ginny',
        lastname: 'Weasley',
        email: 'weasley_ginny@hogwarts.com',
        username: 'weaslegy',
        password: 'ginnysPassword',
        roles: [Role.TUTOR, Role.CORRECTOR],
    }),
    new User({
        firstname: 'Fred',
        lastname: 'Weasley',
        email: 'weasley_fred@hogwarts.com',
        username: 'weaslefd',
        password: 'fredsPassword',
        roles: [Role.CORRECTOR],
    }),
];

export const MOCKED_TUTORIALS: Tutorial[] = [
    new Tutorial({
        slot: 'T11',
        dates: createDatesForTutorial('2020-02-18'),
        startTime: DateTime.fromISO('08:00:00'),
        endTime: DateTime.fromISO('09:30:00'),
    }),
    new Tutorial({
        slot: 'T12',
        dates: createDatesForTutorial('2020-02-21'),
        startTime: DateTime.fromISO('14:00:00'),
        endTime: DateTime.fromISO('15:30:00'),
    }),
    new Tutorial({
        slot: 'T13',
        dates: createDatesForTutorial('2020-02-22'),
        startTime: DateTime.fromISO('14:00:00'),
        endTime: DateTime.fromISO('15:30:00'),
    }),
    new Tutorial({
        slot: 'T14',
        dates: createDatesForTutorial('2020-02-23'),
        startTime: DateTime.fromISO('14:00:00'),
        endTime: DateTime.fromISO('15:30:00'),
    }),
];

export const MOCKED_STUDENTS: Student[] = [
    new Student({
        firstname: 'Hermine',
        lastname: 'Granger',
        matriculationNo: '2345671',
        status: StudentStatus.NO_SCHEIN_REQUIRED,
        tutorial: MOCKED_TUTORIALS[0],
    }),
    new Student({
        firstname: 'Harry',
        lastname: 'Potter',
        matriculationNo: '1234567',
        status: StudentStatus.ACTIVE,
        tutorial: MOCKED_TUTORIALS[0],
    }),
    new Student({
        firstname: 'Ron',
        lastname: 'Weasley',
        matriculationNo: '3456712',
        status: StudentStatus.INACTIVE,
        tutorial: MOCKED_TUTORIALS[0],
    }),
    new Student({
        firstname: 'Draco',
        lastname: 'Malfoy',
        matriculationNo: '8745321',
        status: StudentStatus.INACTIVE,
        tutorial: MOCKED_TUTORIALS[3],
    }),
];

export const MOCKED_TEAMS: Team[] = [
    new Team({ teamNo: 1, tutorial: MOCKED_TUTORIALS[0] }),
    new Team({ teamNo: 2, tutorial: MOCKED_TUTORIALS[0] }),
];

export const MOCKED_SHEETS: Sheet[] = [
    new Sheet({
        sheetNo: 1,
        bonusSheet: false,
        exercises: [
            new Exercise({
                id: v4(),
                exerciseName: 'Exercise 1',
                bonus: false,
                maxPoints: 10,
                subexercises: [],
            }),
            new Exercise({
                id: v4(),
                exerciseName: 'Exercise 2',
                bonus: false,
                maxPoints: 20,
                subexercises: [
                    new SubExercise({ id: v4(), exerciseName: '(a)', bonus: false, maxPoints: 8 }),
                    new SubExercise({ id: v4(), exerciseName: '(b)', bonus: false, maxPoints: 12 }),
                    new SubExercise({ id: v4(), exerciseName: '(c)', bonus: true, maxPoints: 7 }),
                ],
            }),
        ],
    }),
];

export const MOCKED_SCHEINEXAMS: Scheinexam[] = [
    new Scheinexam({
        scheinExamNo: 1,
        date: DateTime.fromISO('2020-01-15'),
        percentageNeeded: 0.4,
        exercises: [
            new Exercise({
                id: v4(),
                exerciseName: 'Exercise 1',
                bonus: false,
                maxPoints: 10,
                subexercises: [],
            }),
            new Exercise({
                id: v4(),
                exerciseName: 'Exercise 2',
                bonus: false,
                maxPoints: 20,
                subexercises: [
                    new SubExercise({ id: v4(), exerciseName: '(a)', bonus: false, maxPoints: 8 }),
                    new SubExercise({ id: v4(), exerciseName: '(b)', bonus: false, maxPoints: 12 }),
                    new SubExercise({ id: v4(), exerciseName: '(c)', bonus: true, maxPoints: 7 }),
                ],
            }),
        ],
    }),
];

export const MOCKED_SHORT_TESTS: ShortTest[] = [
    new ShortTest({
        shortTestNo: 1,
        percentageNeeded: 0.5,
        exercises: [
            new Exercise({
                id: v4(),
                exerciseName: 'Complete test',
                maxPoints: 20,
                bonus: false,
                subexercises: [],
            }),
        ],
    }),
];

export const MOCKED_SCHEINCRITERIAS: ScheincriteriaEntity[] = [
    new ScheincriteriaEntity({
        name: 'Attendance criteria',
        criteria: Scheincriteria.fromDTO({
            identifier: ScheincriteriaIdentifier.ATTENDANCE,
            name: 'Attendance criteria',
            data: { percentage: true, valueNeeded: 0.6 },
        }),
    }),
    new ScheincriteriaEntity({
        name: 'Presentation criteria',
        criteria: Scheincriteria.fromDTO({
            identifier: ScheincriteriaIdentifier.PRESENTATION,
            name: 'Presentation criteria',
            data: { presentationsNeeded: 2 },
        }),
    }),
    new ScheincriteriaEntity({
        name: 'Scheinexam criteria',
        criteria: Scheincriteria.fromDTO({
            identifier: ScheincriteriaIdentifier.SCHEINEXAM,
            name: 'Scheinexam criteria',
            data: {
                passAllExamsIndividually: true,
                percentageOfAllPointsNeeded: 0.5,
            },
        }),
    }),
    new ScheincriteriaEntity({
        name: 'Sheet total criteria',
        criteria: Scheincriteria.fromDTO({
            identifier: ScheincriteriaIdentifier.SHEET_TOTAL,
            name: 'Sheet total criteria',
            data: { percentage: true, valueNeeded: 0.5 },
        }),
    }),
    new ScheincriteriaEntity({
        name: 'Sheet individual criteria',
        criteria: Scheincriteria.fromDTO({
            identifier: ScheincriteriaIdentifier.SHEET_INDIVIDUAL,
            name: 'Sheet individual criteria',
            data: {
                percentage: true,
                valueNeeded: 0.8,
                valuePerSheetNeeded: 0.5,
                percentagePerSheet: true,
            },
        }),
    }),
];

export const MOCKED_SETTINGS_DOCUMENT: Setting[] = [Setting.fromDTO()];

// Adjust entities to include all necessary information
// MOCKED_USERS[3].tutorialsToCorrect = new Collection<Tutorial, unknown>(MOCKED_USERS[3], [
//     MOCKED_TUTORIALS[0],
//     MOCKED_TUTORIALS[2],
// ]);
// MOCKED_TUTORIALS[0].correctors = new Collection<User, unknown>(MOCKED_TUTORIALS[0], [
//     MOCKED_USERS[3],
// ]);
// MOCKED_TUTORIALS[2].correctors = new Collection<User, unknown>(MOCKED_TUTORIALS[0], [
//     MOCKED_USERS[3],
// ]);

MOCKED_TUTORIALS[1].tutor = MOCKED_USERS[2];

MOCKED_STUDENTS[0].team = MOCKED_TEAMS[0];
MOCKED_STUDENTS[0].iliasName = 'HermineGranger';
MOCKED_STUDENTS[0].courseOfStudies = 'Software engineering B. Sc.';

MOCKED_STUDENTS[1].team = MOCKED_TEAMS[0];
MOCKED_STUDENTS[1].iliasName = 'HarryPotter';
MOCKED_STUDENTS[1].courseOfStudies = 'Computer science B. Sc.';
MOCKED_STUDENTS[1].cakeCount = 2;

MOCKED_STUDENTS[2].iliasName = 'RonWeasley';
MOCKED_STUDENTS[2].courseOfStudies = 'Computer science B. Sc.';
MOCKED_STUDENTS[2].email = 'ron@weasley-family.mail';

MOCKED_STUDENTS[3].iliasName = 'DracoMalfoy';
MOCKED_STUDENTS[3].courseOfStudies = 'Computer science B. Sc.';
