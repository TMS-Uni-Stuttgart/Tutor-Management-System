import { DateTime } from 'luxon';
import { ExerciseModel, SubExerciseModel } from '../../src/database/models/exercise.model';
import { ScheincriteriaModel } from '../../src/database/models/scheincriteria.model';
import { ScheinexamModel } from '../../src/database/models/scheinexam.model';
import { SheetModel } from '../../src/database/models/sheet.model';
import { StudentModel } from '../../src/database/models/student.model';
import { TeamModel } from '../../src/database/models/team.model';
import { TutorialModel } from '../../src/database/models/tutorial.model';
import { UserModel } from '../../src/database/models/user.model';
import { Role } from '../../src/shared/model/Role';
import { ScheincriteriaIdentifier } from '../../src/shared/model/ScheinCriteria';
import { StudentStatus } from '../../src/shared/model/Student';
import { MockedModel } from '../helpers/testdocument';

export type MockedSubExerciseModel = MockedModel<Omit<SubExerciseModel, 'id' | '_id'>>;
export type MockedExerciseModel = Omit<MockedModel<ExerciseModel>, 'subexercises'> & {
  subexercises?: MockedSubExerciseModel[];
};
export type MockedSheetModel = Omit<MockedModel<SheetModel>, 'exercises'> & {
  exercises: MockedExerciseModel[];
};
export type MockedScheinexamModel = Omit<MockedModel<ScheinexamModel>, 'exercises'> & {
  exercises: MockedExerciseModel[];
};
export type MockedScheincriteriaModel = Omit<MockedModel<ScheincriteriaModel>, 'criteria'> & {
  criteria: { identifier: string; [key: string]: any };
};

export const USER_DOCUMENTS: MockedModel<UserModel>[] = [
  {
    _id: '5e503aaaab9a9a10831e61f3',
    firstname: 'Albus',
    lastname: 'Dumbledore',
    email: 'dumbledore@hogwarts.com',
    username: 'dumbleas',
    password: 'albusPassword',
    temporaryPassword: undefined,
    roles: [Role.ADMIN],
    tutorials: [],
    tutorialsToCorrect: [],
  },
  {
    _id: '5e501290468622e257c2db16',
    firstname: 'Harry',
    lastname: 'Potter',
    email: 'harrypotter@hogwarts.com',
    username: 'potterhy',
    password: 'harrysPassword',
    temporaryPassword: 'someTemporatayPassword',
    roles: [Role.TUTOR],
    tutorials: [],
    tutorialsToCorrect: [],
  },
  {
    _id: '5e5013711922d1957bcf0c30',
    firstname: 'Ron',
    lastname: 'Weasley',
    email: 'weaslyron@hogwarts.com',
    username: 'weaslern',
    password: 'ronsPassword',
    temporaryPassword: undefined,
    roles: [Role.TUTOR],
    tutorials: [generateFakeDocument('5e5014186db2b69773038a9d')],
    tutorialsToCorrect: [],
  },
  {
    _id: '5e503ac11015dc73652731a6',
    firstname: 'Ginny',
    lastname: 'Weasley',
    email: 'weasley_ginny@hogwarts.com',
    username: 'weaslegy',
    password: 'ginnysPassword',
    temporaryPassword: undefined,
    roles: [Role.TUTOR, Role.CORRECTOR],
    tutorials: [],
    tutorialsToCorrect: [generateFakeDocument('5e5014186db2b69773038a9d')],
  },
  {
    _id: '5e5255f7b0f499ba072261ea',
    firstname: 'FRED',
    lastname: 'Weasley',
    email: 'weasley_fred@hogwarts.com',
    username: 'weaslefd',
    password: 'fredsPassword',
    temporaryPassword: undefined,
    roles: [Role.CORRECTOR],
    tutorials: [],
    tutorialsToCorrect: [],
  },
];

export const TUTORIAL_DOCUMENTS: MockedModel<TutorialModel>[] = [
  {
    _id: '5e50141098205a0d95857492',
    tutor: undefined,
    slot: 'Tutorial 11',
    students: [
      generateFakeDocument('5e503faaec719cfb56f99496'),
      generateFakeDocument('5e503fa7467c801a4953e0b6'),
      generateFakeDocument('5e503fa4396e8d6f315f7194'),
    ],
    teams: [
      generateFakeDocument('5e5a48b128fa40e1a26b7ddb'),
      generateFakeDocument('5e5a48fcc99e7f140d2c946a'),
    ],
    correctors: [],
    dates: createDatesForTutorial('2020-02-18'),
    startTime: DateTime.fromISO('08:00:00'),
    endTime: DateTime.fromISO('09:30:00'),
    substitutes: new Map(),
  },
  {
    _id: '5e5014186db2b69773038a9d',
    tutor: generateFakeDocument('5e5013711922d1957bcf0c30'),
    slot: 'Tutorial 12',
    students: [],
    teams: [],
    correctors: [generateFakeDocument('5e503ac11015dc73652731a6')],
    dates: createDatesForTutorial('2020-02-21'),
    startTime: DateTime.fromISO('14:00:00'),
    endTime: DateTime.fromISO('15:30:00'),
    substitutes: new Map(),
  },
  {
    _id: '5e51421a7fd4b19a4cbe933f',
    tutor: undefined,
    slot: 'Tutorial 14',
    students: [generateFakeDocument('5e5a4ce8b3a28d41d3370349')],
    teams: [],
    correctors: [],
    dates: createDatesForTutorial('2020-02-21'),
    startTime: DateTime.fromISO('14:00:00'),
    endTime: DateTime.fromISO('15:30:00'),
    substitutes: new Map(),
  },
  {
    _id: '5e5a4cfc318e40b25051a877',
    tutor: undefined,
    slot: 'Tutorial 13',
    students: [],
    teams: [],
    correctors: [],
    dates: createDatesForTutorial('2020-02-21'),
    startTime: DateTime.fromISO('14:00:00'),
    endTime: DateTime.fromISO('15:30:00'),
    substitutes: new Map(),
  },
];

export const STUDENT_DOCUMENTS: MockedModel<StudentModel>[] = [
  {
    _id: '5e503faaec719cfb56f99496',
    firstname: 'Hermine',
    lastname: 'Granger',
    tutorial: generateFakeDocument('5e50141098205a0d95857492', { slot: 'Tutorial 11' }),
    status: StudentStatus.NO_SCHEIN_REQUIRED,
    courseOfStudies: 'Software engineering B. Sc.',
    email: 'granger_hermine@hogwarts.com',
    matriculationNo: '2345671',
    cakeCount: 0,
    team: generateFakeDocument('5e5a48b128fa40e1a26b7ddb', { teamNo: 1 }),
    attendances: new Map(),
    presentationPoints: new Map(),
  },
  {
    _id: '5e503fa7467c801a4953e0b6',
    firstname: 'Harry',
    lastname: 'Potter',
    tutorial: generateFakeDocument('5e50141098205a0d95857492', { slot: 'Tutorial 11' }),
    status: StudentStatus.ACTIVE,
    courseOfStudies: 'Computer science B. Sc.',
    email: 'potter_harry@hogwarts.com',
    matriculationNo: '1234567',
    cakeCount: 2,
    team: generateFakeDocument('5e5a48b128fa40e1a26b7ddb', { teamNo: 1 }),
    attendances: new Map(),
    presentationPoints: new Map(),
  },
  {
    _id: '5e503fa4396e8d6f315f7194',
    firstname: 'Weasley',
    lastname: 'Ron',
    tutorial: generateFakeDocument('5e50141098205a0d95857492', { slot: 'Tutorial 11' }),
    status: StudentStatus.INACTIVE,
    courseOfStudies: 'Computer science B. Sc.',
    email: 'weasley_ron@hogwarts.com',
    matriculationNo: '3456712',
    cakeCount: 0,
    team: undefined,
    attendances: new Map(),
    presentationPoints: new Map(),
  },
  {
    _id: '5e5a4ce8b3a28d41d3370349',
    firstname: 'Draco',
    lastname: 'Malfoy',
    tutorial: generateFakeDocument('5e51421a7fd4b19a4cbe933f', { slot: 'Tutorial 14' }),
    status: StudentStatus.INACTIVE,
    courseOfStudies: 'Computer science B. Sc.',
    email: 'malfoy_draco@hogwarts.com',
    matriculationNo: '8745321',
    cakeCount: 0,
    team: undefined,
    attendances: new Map(),
    presentationPoints: new Map(),
  },
];

export const TEAM_DOCUMENTS: MockedModel<TeamModel>[] = [
  {
    _id: '5e5a48b128fa40e1a26b7ddb',
    tutorial: generateFakeDocument('5e50141098205a0d95857492'),
    teamNo: 1,
    students: [
      generateFakeDocument('5e503faaec719cfb56f99496'),
      generateFakeDocument('5e503fa7467c801a4953e0b6'),
    ],
  },
  {
    _id: '5e5a48fcc99e7f140d2c946a',
    tutorial: generateFakeDocument('5e50141098205a0d95857492'),
    teamNo: 2,
    students: [],
  },
];

export const SHEET_DOCUMENTS: MockedSheetModel[] = [
  {
    _id: '5e5528e1e9010217b62efbb5',
    sheetNo: 1,
    bonusSheet: false,
    totalPoints: 30, // Put the expected sum of all exercises here.
    exercises: [
      {
        _id: '5e552a0496f8e7414a001cd6',
        exName: 'Exercise 1',
        bonus: false,
        maxPoints: 10,
        pointInfo: { must: 10, bonus: 0 },
      },
      {
        _id: '5e552a07d55e796b8e3c51a9',
        exName: 'Exercise 2',
        bonus: false,
        maxPoints: 20, // Put the expected sum of the subexercises here.
        pointInfo: { must: 20, bonus: 0 },
        subexercises: [
          {
            _id: '5e552a0a6ae88eda225ff562',
            exName: '(a)',
            bonus: false,
            maxPoints: 8,
            pointInfo: { must: 8, bonus: 0 },
          },
          {
            _id: '5e552a0fd4d6f5c245617212',
            exName: '(b)',
            bonus: false,
            maxPoints: 12,
            pointInfo: { must: 12, bonus: 0 },
          },
        ],
      },
    ],
  },
];

export const SCHEINEXAM_DOCUMENTS: MockedScheinexamModel[] = [
  {
    _id: '5e565b58d8d3cb7660bf01d7',
    scheinExamNo: 1,
    date: DateTime.fromISO('2020-01-15'),
    percentageNeeded: 0.4,
    totalPoints: { must: 30, bonus: 0 },
    exercises: [
      {
        _id: '5e552a0496f8e7414a001cd6',
        exName: 'Exercise 1',
        bonus: false,
        maxPoints: 10,
        pointInfo: { must: 10, bonus: 0 },
      },
      {
        _id: '5e552a07d55e796b8e3c51a9',
        exName: 'Exercise 2',
        bonus: false,
        maxPoints: 20, // Put the expected sum of the subexercises here.
        pointInfo: { must: 20, bonus: 0 },
        subexercises: [
          {
            _id: '5e552a0a6ae88eda225ff562',
            exName: '(a)',
            bonus: false,
            maxPoints: 8,
            pointInfo: { must: 8, bonus: 0 },
          },
          {
            _id: '5e552a0fd4d6f5c245617212',
            exName: '(b)',
            bonus: false,
            maxPoints: 12,
            pointInfo: { must: 12, bonus: 0 },
          },
        ],
      },
    ],
  },
];

export const SCHEINCRITERIA_DOCUMENTS: MockedScheincriteriaModel[] = [
  {
    _id: '5e59295a14255d6110d892a8',
    name: 'Attendance criteria',
    criteria: {
      identifier: ScheincriteriaIdentifier.ATTENDANCE,
      percentage: true,
      valueNeeded: 0.6,
    },
  },
  {
    _id: '5e5929b16aabf232282f33dc',
    name: 'Presentation criteria',
    criteria: {
      identifier: ScheincriteriaIdentifier.PRESENTATION,
      presentationsNeeded: 2,
    },
  },
  {
    _id: '5e592a7872211d1b70af9cb0',
    name: 'Scheinexam criteria',
    criteria: {
      identifier: ScheincriteriaIdentifier.SCHEINEXAM,
      passAllExamsIndividually: true,
      percentageOfAllPointsNeeded: 0.5,
    },
  },
  {
    _id: '5e592aad72211d1b70af9cb1',
    name: 'Sheet Total criteria',
    criteria: {
      identifier: ScheincriteriaIdentifier.SHEET_TOTAL,
      percentage: true,
      valueNeeded: 0.5,
    },
  },
  {
    _id: '5e592ace72211d1b70af9cb2',
    name: 'Sheet Individual criteria',
    criteria: {
      identifier: ScheincriteriaIdentifier.SHEET_INDIVIDUAL,
      percentage: true,
      valueNeeded: 0.8,
      valuePerSheetNeeded: 0.5,
      percentagePerSheet: true,
    },
  },
];

function generateFakeDocument(_id: string, additional?: object): any {
  return { _id, ...additional };
}

/**
 * Creates a few days each one week apart starting at the given date (or 2020-02-17).
 *
 * Those days are returned in their JSON string format.
 *
 * @param startISODate (_default: '2020-02-17'_) An optional starting date for the created dates.
 *
 * @returns 10 days as JS Dates.
 */
export function createDatesForTutorial(startISODate: string = '2020-02-17'): DateTime[] {
  const baseDate = DateTime.fromISO(startISODate);
  const dates: DateTime[] = [];

  for (let i = 0; i < 10; i++) {
    dates.push(baseDate.plus({ weeks: i }));
  }

  return dates;
}

/**
 * Creates a few days each one week apart starting at the given date (or 2020-02-17).
 *
 * Those days are returned in their JSON string format.
 *
 * @param startISODate (_default: '2020-02-17'_) An optional starting date for the created dates.
 *
 * @returns 10 days in JSON string format.
 */
export function createDatesForTutorialAsStrings(startISODate: string = '2020-02-17'): string[] {
  const baseDate = DateTime.fromISO(startISODate);
  const dates: DateTime[] = [];

  for (let i = 0; i < 10; i++) {
    dates.push(baseDate.plus({ weeks: i }));
  }

  return dates.map(date => date.toISODate());
}
