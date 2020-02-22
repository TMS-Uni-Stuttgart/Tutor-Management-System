import { DateTime } from 'luxon';
import { StudentModel } from '../../src/database/models/student.model';
import { TutorialModel } from '../../src/database/models/tutorial.model';
import { UserModel } from '../../src/database/models/user.model';
import { Role } from '../../src/shared/model/Role';
import { StudentStatus } from '../../src/shared/model/Student';
import { MockedModel } from '../helpers/testdocument';

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
];

export const TUTORIAL_DOCUMENTS: MockedModel<TutorialModel>[] = [
  {
    _id: '5e50141098205a0d95857492',
    tutor: undefined,
    slot: 'Tutorial 1',
    students: [
      generateFakeDocument('5e503faaec719cfb56f99496'),
      generateFakeDocument('5e503fa7467c801a4953e0b6'),
      generateFakeDocument('5e503fa4396e8d6f315f7194'),
    ],
    teams: [],
    correctors: [],
    dates: createDatesForTutorial('2020-02-18'),
    startTime: DateTime.fromISO('08:00:00', { zone: 'utc' }).toJSDate(),
    endTime: DateTime.fromISO('09:30:00', { zone: 'utc' }).toJSDate(),
    substitutes: new Map(),
  },
  {
    _id: '5e5014186db2b69773038a9d',
    tutor: generateFakeDocument('5e5013711922d1957bcf0c30'),
    slot: 'Tutorial 2',
    students: [],
    teams: [],
    correctors: [generateFakeDocument('5e503ac11015dc73652731a6')],
    dates: createDatesForTutorial('2020-02-21'),
    startTime: DateTime.fromISO('14:00:00', { zone: 'utc' }).toJSDate(),
    endTime: DateTime.fromISO('15:30:00', { zone: 'utc' }).toJSDate(),
    substitutes: new Map(),
  },
  {
    _id: '5e51421a7fd4b19a4cbe933f',
    tutor: undefined,
    slot: 'Tutorial 2',
    students: [],
    teams: [],
    correctors: [],
    dates: createDatesForTutorial('2020-02-21'),
    startTime: DateTime.fromISO('14:00:00', { zone: 'utc' }).toJSDate(),
    endTime: DateTime.fromISO('15:30:00', { zone: 'utc' }).toJSDate(),
    substitutes: new Map(),
  },
];

export const STUDENT_DOCUMENTS: MockedModel<StudentModel>[] = [
  {
    _id: '5e503faaec719cfb56f99496',
    firstname: 'Hermine',
    lastname: 'Granger',
    tutorial: generateFakeDocument('5e50141098205a0d95857492', { slot: 'Tutorial 1' }),
    status: StudentStatus.NO_SCHEIN_REQUIRED,
    courseOfStudies: 'Software engineering B. Sc.',
    email: 'granger_hermine@hogwarts.com',
    matriculationNo: '2345671',
    cakeCount: 0,
    team: undefined,
    attendances: new Map(),
    gradings: new Map(),
  },
  {
    _id: '5e503fa7467c801a4953e0b6',
    firstname: 'Harry',
    lastname: 'Potter',
    tutorial: generateFakeDocument('5e50141098205a0d95857492', { slot: 'Tutorial 1' }),
    status: StudentStatus.ACTIVE,
    courseOfStudies: 'Computer science B. Sc.',
    email: 'potter_harry@hogwarts.com',
    matriculationNo: '1234567',
    cakeCount: 2,
    team: undefined,
    attendances: new Map(),
    gradings: new Map(),
  },
  {
    _id: '5e503fa4396e8d6f315f7194',
    firstname: 'Draco',
    lastname: 'Malfoy',
    tutorial: generateFakeDocument('5e50141098205a0d95857492', { slot: 'Tutorial 1' }),
    status: StudentStatus.INACTIVE,
    courseOfStudies: 'Computer science B. Sc.',
    email: 'malfoy_draco@hogwarts.com',
    matriculationNo: '3456712',
    cakeCount: 0,
    team: undefined,
    attendances: new Map(),
    gradings: new Map(),
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
export function createDatesForTutorial(startISODate: string = '2020-02-17'): Date[] {
  const baseDate = DateTime.fromISO(startISODate, { zone: 'utc' });
  const dates: DateTime[] = [];

  for (let i = 0; i < 10; i++) {
    dates.push(baseDate.plus({ weeks: i }));
  }

  return dates.map(date => date.toJSDate());
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
  const baseDate = DateTime.fromISO(startISODate, { zone: 'utc' });
  const dates: DateTime[] = [];

  for (let i = 0; i < 10; i++) {
    dates.push(baseDate.plus({ weeks: i }));
  }

  return dates.map(date => date.toJSON());
}
