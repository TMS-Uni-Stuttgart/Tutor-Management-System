import Axios from 'axios';
import { LoggedInUser } from 'shared/src/model/User';
import { StudentDTO, StudentStatus, Student } from 'shared/src/model/Student';
import { TutorialDTO, Tutorial } from 'shared/src/model/Tutorial';
import { Sheet, SheetDTO, ExerciseDTO } from 'shared/src/model/Sheet';
import { createSheet, setPointsOfStudent } from './fetch/helpers';
import { PointMap, PointId, PointsOfSubexercises } from 'shared/src/model/Points';

function createBaseURL(): string {
  return 'http://localhost:8080/api';
}

const axios = Axios.create({
  baseURL: createBaseURL(),
  // withCredentials: true,
  withCredentials: true,
  headers: {
    // This header prevents the spring backend to add a header which will make a popup appear if the credentials are wrong.
    'X-Requested-With': 'XMLHttpRequest',
  },
  // Configure to use auth every time bc node can not save cookies.
  // auth: {
  //   username: 'admin',
  //   password: 'admin',
  // },
});

const cookies: string[] = [];

function roundNumber(number: number, places: number = 2): number {
  return Math.round(number * Math.pow(10, places)) / Math.pow(10, places);
}

async function login(username: string, password: string): Promise<void> {
  // We build the Authorization header by ourselfs because the axios library does NOT use UTF-8 to encode the string as base64.
  const encodedAuth = Buffer.from(username + ':' + password, 'utf8').toString('base64');
  const response = await axios.post<LoggedInUser>('/login', null, {
    headers: {
      Authorization: `Basic ${encodedAuth}`,
    },
    // Override the behaviour of checking the response status to not be 401 (session timed out)
    validateStatus: () => true,
  });

  const [cookie] = response.headers['set-cookie'] || [undefined];

  if (cookie) {
    cookies.push(cookie);

    axios.defaults.headers.Cookie = cookie;
  }
}

async function createTutorial(): Promise<Tutorial> {
  const tutorialDTO: TutorialDTO = {
    slot: 'G1',
    startTime: '09:45:00',
    endTime: '11:15:00',
    dates: [new Date().toDateString(), new Date().toDateString()],
    correctorIds: [],
  };

  const tutorialResponse = await axios.post<Tutorial>('/tutorial', tutorialDTO);
  if (tutorialResponse.status !== 201) {
    throw new Error('Tutorial could not be created.');
  }

  return tutorialResponse.data;
}

async function createSheets(): Promise<Sheet[]> {
  const sheets: Sheet[] = [];

  for (let i = 0; i < 12; i++) {
    const sheetNo = i + 1;
    const hasSubexercises = Math.random() >= 0.5;
    const subexercises: ExerciseDTO[] = [];

    if (hasSubexercises) {
      for (let i = 0; i < Math.round(Math.random() * 2 + 1); i++) {
        subexercises.push({
          exName: `Subex ${i + 1}`,
          maxPoints: roundNumber(Math.random() * 12 + 4),
          subexercises: [],
          bonus: false,
        });
      }
    }

    const maxPoints =
      subexercises.length > 0
        ? subexercises.reduce((sum, ex) => ex.maxPoints + sum, 0)
        : roundNumber(Math.random() * 10 + 5, 0);

    const sheetDTO: SheetDTO = {
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

    console.log(`Created sheet #${sheet.sheetNo}`);
  }

  console.log('All sheets created.');

  return sheets;
}

async function run() {
  try {
    await login('admin', 'admin');

    const tutorial = await createTutorial();
    const sheets = await createSheets();

    for (let i = 0; i < 600; i++) {
      const studentDTO: StudentDTO = {
        firstname: 'Test',
        lastname: `Student #${i.toString().padStart(3, '0')}`,
        status: StudentStatus.ACTIVE,
        tutorial: tutorial.id,
        matriculationNo: i.toString().padStart(7, '0'),
        // TODO: Rest of properties?
      };

      const student = (await axios.post<Student>('/student', studentDTO)).data;
      const pointMap = new PointMap();

      for (const sheet of sheets) {
        for (const exercise of sheet.exercises) {
          if (exercise.subexercises.length > 0) {
            const entry: PointsOfSubexercises = {};

            exercise.subexercises.forEach(subEx => {
              entry[subEx.id] = roundNumber(Math.random() * subEx.maxPoints);
            });

            pointMap.setPointEntry(new PointId(sheet.id, exercise), { comment: '', points: entry });
          } else {
            pointMap.setPointEntry(new PointId(sheet.id, exercise), {
              comment: '',
              points: roundNumber(Math.random() * exercise.maxPoints),
            });
          }
        }
      }

      await setPointsOfStudent(student.id, { points: pointMap.toDTO() }, axios);

      if (i % 50 === 0) {
        console.log(`Created student #${i}`);
      }
    }

    console.log('All students created.');
  } catch (err) {
    console.log(err);
  }
}

run();
