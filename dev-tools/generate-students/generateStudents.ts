/* eslint-disable no-console */
import { AxiosInstance } from 'axios';
import { IExerciseGradingDTO, IGradingDTO } from '../../server/src/shared/model/Points';
import { IExerciseDTO, ISheet, ISheetDTO } from '../../server/src/shared/model/Sheet';
import { IStudent, IStudentDTO, StudentStatus } from '../../server/src/shared/model/Student';
import { ITutorial, ITutorialDTO } from '../../server/src/shared/model/Tutorial';
import { login } from '../util/login';
import { createSheet, setPointsOfStudent } from './fetch/helpers';

let axios: AxiosInstance;

function roundNumber(number: number, places: number = 2): number {
  return Math.round(number * Math.pow(10, places)) / Math.pow(10, places);
}

async function createTutorial(): Promise<ITutorial> {
  const tutorialDTO: ITutorialDTO = {
    slot: 'G1',
    startTime: '09:45:00',
    endTime: '11:15:00',
    dates: [new Date().toDateString(), new Date().toDateString()],
    correctorIds: [],
  };

  const tutorialResponse = await axios.post<ITutorial>('/tutorial', tutorialDTO);
  if (tutorialResponse.status !== 201) {
    throw new Error('Tutorial could not be created.');
  }

  return tutorialResponse.data;
}

async function createSheets(): Promise<ISheet[]> {
  const sheets: ISheet[] = [];

  for (let i = 0; i < 12; i++) {
    const sheetNo = i + 1;
    const hasSubexercises = Math.random() >= 0.5;
    const subexercises: IExerciseDTO[] = [];

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

    console.log(`Created sheet #${sheet.sheetNo}`);
  }

  console.log('All sheets created.');

  return sheets;
}

async function createStudent(i: number, tutorial: ITutorial, sheets: ISheet[]): Promise<IStudent> {
  const studentDTO: IStudentDTO = {
    firstname: 'Test',
    lastname: `Student #${i.toString().padStart(3, '0')}`,
    status: StudentStatus.ACTIVE,
    tutorial: tutorial.id,
    matriculationNo: i.toString().padStart(7, '0'),
  };

  const student = (await axios.post<IStudent>('/student', studentDTO)).data;
  const gradings: IGradingDTO[] = [];

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

  await Promise.all(
    gradings.map((gradingDTO) => setPointsOfStudent(student.id, gradingDTO, axios))
  );

  return student;
}

async function run() {
  try {
    axios = await login('admin', 'admin');

    const tutorial = await createTutorial();
    const sheets = await createSheets();

    const promises: Promise<IStudent>[] = [];

    for (let i = 0; i < 600; i++) {
      if (i > 0 && i % 200 === 0) {
        try {
          console.log('Waiting for previous requests to finish...');
          await Promise.all(promises);
        } catch (err) {
          console.log('[ERROR] Could not get response from some requests.');
        } finally {
          promises.splice(0, promises.length);
        }
      }

      promises.push(createStudent(i, tutorial, sheets));

      console.log(`Request to create student #${i} made...`);
    }

    await Promise.all(promises);
    console.log('All students created.');
  } catch (err) {
    console.log(`[ERROR] -- ${err.message}`);
  }
}

run();
