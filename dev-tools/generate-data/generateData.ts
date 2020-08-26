/* eslint-disable no-console */
import { AxiosInstance } from 'axios';
import { DateTime } from 'luxon';
import { AttendanceState, IAttendanceDTO } from '../../server/src/shared/model/Attendance';
import { IExerciseGradingDTO, IGradingDTO } from '../../server/src/shared/model/Gradings';
import { IExerciseDTO } from '../../server/src/shared/model/HasExercises';
import { Role } from '../../server/src/shared/model/Role';
import { ISheet, ISheetDTO } from '../../server/src/shared/model/Sheet';
import { IShortTest, IShortTestDTO } from '../../server/src/shared/model/ShortTest';
import { IStudent, IStudentDTO, StudentStatus } from '../../server/src/shared/model/Student';
import { ITutorial, ITutorialDTO } from '../../server/src/shared/model/Tutorial';
import { ICreateUserDTO, IUser } from '../../server/src/shared/model/User';
import { login } from '../util/login';
import {
  createSheet,
  createShortTest,
  createUser,
  setAttendanceOfStudent,
  setPointsOfStudent,
} from './fetch/helpers';

const STUDENTS_TOTAL = 600;
const TUTORIALS_TOTAL = 50;
const TUTORIAL_DATES_COUNT = 12;
const TUTORS_TOTAL = 25;
const SHEETS_TOTAL = 10;
const SHORT_TESTS_TOTAL = 9;

const REQUESTS_AT_ONCE = 20;
const WAIT_TIME_AFTER = 30000;

let axios: AxiosInstance;

function roundNumber(number: number, places: number = 1): number {
  return Math.round(number * Math.pow(10, places)) / Math.pow(10, places);
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    console.log(`Waiting for ${ms}ms.`);

    setTimeout(() => resolve(), ms);
  });
}

async function createTutorials(): Promise<ITutorial[]> {
  console.log(`Creating ${TUTORIALS_TOTAL} tutorials...`);
  const tutorials: ITutorial[] = [];

  for (let i = 0; i < TUTORIALS_TOTAL; i++) {
    try {
      tutorials.push(await createTutorial(i));
      await wait(1000);
    } catch (err) {
      console.error(err);
    }
  }

  if (tutorials.length === 0) {
    throw new Error('Could not create any tutorials.');
  }

  console.log(
    `${tutorials.length} tutorials successfully created (${
      TUTORIALS_TOTAL - tutorials.length
    } failed).`
  );
  return tutorials;
}

async function createTutorial(nr: number): Promise<ITutorial> {
  const slot = `G${nr.toString(10).padStart(2, '0')}`;
  const dates: string[] = [];

  for (let i = 0; i < TUTORIAL_DATES_COUNT; i++) {
    dates.push(
      DateTime.local()
        .plus({ days: i * 7 })
        .toISODate() ?? ''
    );
  }

  const tutorialDTO: ITutorialDTO = {
    slot,
    startTime: '09:45:00',
    endTime: '11:15:00',
    dates: dates.filter(Boolean),
    correctorIds: [],
  };

  console.log(`Creating tutorial ${slot}...`);
  const tutorialResponse = await axios.post<ITutorial>('/tutorial', tutorialDTO);

  if (tutorialResponse.status !== 201) {
    console.error(tutorialResponse.data);
    throw new Error(`Tutorial ${slot} could not be created.`);
  }

  console.log(`Tutorial ${slot} created`);
  return tutorialResponse.data;
}

async function createUsers(tutorials: ITutorial[]): Promise<void> {
  const users: IUser[] = [];
  const tutorialsAvailable = [...tutorials];

  for (let i = 0; i < TUTORS_TOTAL; i++) {
    const userNr = i.toString(10).padStart(2, '0');
    const tutorials: string[] = [];
    let tutorialCount = roundNumber(Math.random() * 2 + 1, 0);

    const usersToCreateAfterThisOne = TUTORS_TOTAL - i - 1;
    const tutorialsLeftAfterThisGeneration = tutorialsAvailable.length - tutorialCount;

    if (usersToCreateAfterThisOne > tutorialsLeftAfterThisGeneration) {
      console.log('Forcing to only have 1 tutorial.');
      tutorialCount = 1;
    }

    tutorials.push(...tutorialsAvailable.splice(0, tutorialCount).map((t) => t.id));

    const dto: ICreateUserDTO = {
      firstname: `Firstname${userNr}`,
      lastname: `Lastname${userNr}`,
      email: `user${userNr}@testing.test`,
      username: `user${userNr}`,
      password: `pass${userNr}`,
      roles: [Role.TUTOR],
      tutorials,
      tutorialsToCorrect: [],
    };

    try {
      console.log(`Creating user #${userNr}...`);
      users.push(await createUser(dto, axios));
      await wait(1000);
      console.log(`User #${userNr} created.`);
    } catch (err) {
      console.log(err);
    }
  }

  console.log(`${users.length} user created (${TUTORS_TOTAL - users.length} failed).`);
}

async function createSheets(): Promise<ISheet[]> {
  const sheets: ISheet[] = [];

  for (let i = 0; i < SHEETS_TOTAL; i++) {
    const sheetNo = i + 1;
    const hasSubexercises = Math.random() >= 0.5;
    const subexercises: IExerciseDTO[] = [];

    if (hasSubexercises) {
      for (let i = 0; i < Math.round(Math.random() * 2 + 1); i++) {
        subexercises.push({
          exName: `Subex ${i + 1}`,
          maxPoints: roundNumber(Math.random() * 12 + 4, 0),
          subexercises: [],
          bonus: false,
        });
      }
    }

    const maxPoints =
      subexercises.length > 0
        ? subexercises.reduce((sum, ex) => ex.maxPoints + sum, 0)
        : roundNumber(Math.random() * 10 + 5, 0);

    const sheetDTO: ISheetDTO = {
      sheetNo,
      exercises: [
        {
          exName: `Exercise ${sheetNo}`,
          maxPoints,
          subexercises,
          bonus: false,
        },
      ],
      bonusSheet: false,
    };

    const sheet = await createSheet(sheetDTO, axios);
    sheets.push(sheet);

    await wait(500);
    console.log(`Created sheet #${sheet.sheetNo}`);
  }

  console.log(`${sheets.length} sheets created (${SHEETS_TOTAL - sheets.length} failed).`);

  return sheets;
}

async function createShortTests(): Promise<IShortTest[]> {
  const shortTests: IShortTest[] = [];

  for (let i = 0; i < SHORT_TESTS_TOTAL; i++) {
    const shortTestNo = i + 1;
    const dto: IShortTestDTO = {
      shortTestNo,
      percentageNeeded: 0.5,
      exercises: [
        {
          exName: 'Complete test',
          bonus: false,
          maxPoints: roundNumber(Math.random() * 10 + 10, 0),
          subexercises: [],
        },
      ],
    };

    try {
      console.log(`Creating short test #${shortTestNo}...`);
      shortTests.push(await createShortTest(dto, axios));

      await wait(500);
      console.log(`Short test #${shortTestNo} created.`);
    } catch (err) {
      console.log(err);
    }
  }

  console.log(
    `${shortTests.length} short tests created (${SHORT_TESTS_TOTAL - shortTests.length} failed).`
  );
  return shortTests;
}

async function createStudents({
  tutorials,
  sheets,
  shortTests,
}: CreateMultipleStudentsParams): Promise<void> {
  const promises: Promise<IStudent>[] = [];

  for (let i = 0; i < STUDENTS_TOTAL; i++) {
    if (i > 0 && i % REQUESTS_AT_ONCE === 0) {
      try {
        console.log('Waiting for previous requests to finish...');
        await Promise.all(promises);

        await wait(WAIT_TIME_AFTER);
      } catch (err) {
        console.log('[ERROR] Could not get response from some requests.');
      } finally {
        promises.splice(0, promises.length);
      }
    }

    const tutorial = tutorials[i % tutorials.length];
    promises.push(createStudent({ no: i, tutorial, sheets, shortTests }));

    console.log(`Request to create student #${i} made...`);
  }

  await Promise.all(promises);
  console.log('All students created.');
}

async function createStudent({
  no,
  tutorial,
  sheets,
  shortTests,
}: CreateStudentParams): Promise<IStudent> {
  const noLabel = no.toString().padStart(3, '0');
  const studentDTO: IStudentDTO = {
    firstname: 'Test',
    lastname: `Student #${noLabel}`,
    iliasName: `ilias${noLabel}`,
    status: StudentStatus.ACTIVE,
    tutorial: tutorial.id,
    matriculationNo: no.toString().padStart(7, '0'),
  };

  const student = (await axios.post<IStudent>('/student', studentDTO)).data;
  const gradings: IGradingDTO[] = [];
  const attendances: IAttendanceDTO[] = [];

  sheets.forEach((sheet) => {
    const exerciseGradings: Map<string, IExerciseGradingDTO> = new Map();

    sheet.exercises.forEach((exercise) => {
      if (exercise.subexercises.length > 0) {
        const subExercisePoints: Map<string, number> = new Map();

        exercise.subexercises.forEach((subEx) => {
          subExercisePoints.set(subEx.id, roundNumber(Math.random() * subEx.maxPoints));
        });

        exerciseGradings.set(exercise.id, {
          comment: '',
          additionalPoints: 0,
          subExercisePoints: [...subExercisePoints],
        });
      } else {
        exerciseGradings.set(exercise.id, {
          comment: '',
          additionalPoints: 0,
          points: roundNumber(Math.random() * exercise.maxPoints),
        });
      }
    });

    gradings.push({
      sheetId: sheet.id,
      additionalPoints: 0,
      comment: '',
      exerciseGradings: [...exerciseGradings],
    });
  });

  shortTests.forEach((shortTest) => {
    const exerciseGradings: Map<string, IExerciseGradingDTO> = new Map();

    shortTest.exercises.forEach((exercise) => {
      exerciseGradings.set(exercise.id, {
        comment: '',
        additionalPoints: 0,
        points: roundNumber(Math.random() * exercise.maxPoints),
      });
    });

    gradings.push({
      shortTestId: shortTest.id,
      additionalPoints: 0,
      comment: '',
      exerciseGradings: [...exerciseGradings],
    });
  });

  tutorial.dates.forEach((date) => {
    let state: AttendanceState;
    const stateNo: number = Math.random();

    if (stateNo < 0.1) {
      // 10% chance
      state = AttendanceState.UNEXCUSED;
    } else if (stateNo < 0.35) {
      // 25% chance
      state = AttendanceState.EXCUSED;
    } else {
      // 65% chance
      state = AttendanceState.PRESENT;
    }

    attendances.push({
      date,
      note: Math.random() > 0.8 ? 'Some note' : undefined,
      state,
    });
  });

  try {
    console.log(`Generating evaluation information for student ${student.lastname}...`);
    await Promise.all(
      gradings.map((gradingDTO) => setPointsOfStudent(student.id, gradingDTO, axios))
    );
  } catch (err) {
    console.error(err);
  }

  try {
    console.log(`Generating attendance information for student ${student.lastname}...`);
    await Promise.all(
      attendances.map((attendanceDTO) => setAttendanceOfStudent(student.id, attendanceDTO, axios))
    );
  } catch (err) {
    console.error(err);
  }

  return student;
}

async function run() {
  try {
    axios = await login('admin', 'adminPass1');

    const tutorials = await createTutorials();
    await wait(WAIT_TIME_AFTER);

    await createUsers(tutorials);
    await wait(WAIT_TIME_AFTER);

    const sheets = await createSheets();
    await wait(WAIT_TIME_AFTER);

    const shortTests = await createShortTests();
    await wait(WAIT_TIME_AFTER);

    await createStudents({ tutorials, sheets, shortTests });
  } catch (err) {
    console.log(`[ERROR] -- ${err.message}`);
    process.exit(1);
  }
}

run();

interface CreateStudentParams {
  no: number;
  tutorial: ITutorial;
  sheets: ISheet[];
  shortTests: IShortTest[];
}

interface CreateMultipleStudentsParams {
  tutorials: ITutorial[];
  sheets: ISheet[];
  shortTests: IShortTest[];
}
