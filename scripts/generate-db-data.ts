import faker from 'faker';
import axios from './fetching/Axios';
import { createTutorial } from './fetching/Tutorial';
import { TutorialDTO, ExerciseDTO } from './typings/RequestDTOs';
import { Tutorial, User, Role, Student, ScheinExam } from './typings/ServerResponses';
import { createUser } from './fetching/User';
import { createStudent } from './fetching/Student';
import { addMinutes, format } from 'date-fns';
import { Sheet } from './typings/RatingModel';
import { createSheet } from './fetching/Sheet';
import { createScheinExam } from './fetching/ScheinExam';

faker.locale = 'de';

const TUTORIAL_COUNT = 25;
const STUDENT_COUNT_PER_TUTORIAL = {
  min: 20,
  max: 24,
};
const SHEET_COUNT = 11;
const EXERCISE_COUNT_PER_SHEET = {
  min: 3,
  max: 7,
};
const SCHEIN_EXAM_COUNT = 2;
const EXERCISE_COUNT_PER_EXAM = {
  min: 5,
  max: 10,
};

let MATR_NO: string[] = [];

for (let i = 1000000; i <= 9999999; i++) {
  MATR_NO.push(i.toString().padStart(7, '0'));
}

async function createTutorials(tutorialCount: number): Promise<Tutorial[]> {
  console.group(`Creating ${tutorialCount} tutorials...`);

  const tutorials: Tutorial[] = [];

  for (let i = 0; i < tutorialCount; i++) {
    console.log(`Creating tutorial with slot ${i + 1}...`);
    const startTime = new Date(Date.now());
    const endTime = addMinutes(startTime, 90);

    tutorials.push(
      await createTutorial({
        slot: i + 1,
        tutorId: null,
        dates: [new Date(Date.now()).toISOString()],
        startTime: format(startTime, 'hh:mm:ss'),
        endTime: format(endTime, 'hh:mm:ss'),
        correctorIds: [],
      })
    );
  }

  console.log('Finished creating tutorials.');
  console.groupEnd();

  return tutorials;
}

async function addTutorToTutorial(tutorial: Tutorial): Promise<User> {
  console.log(`Adding user to tutorial #${tutorial.slot.toString().padStart(2, '0')}`);

  return createUser({
    firstname: `first-${tutorial.slot}`,
    lastname: `last-${tutorial.slot}`,
    password: 'generatedUser',
    username: `user${tutorial.slot.toString().padStart(2, '0')}`,
    roles: [Role.TUTOR],
    tutorials: [tutorial.id],
  });
}

async function addStudentsToTutorial(tutorial: Tutorial): Promise<Student[]> {
  const { min, max } = STUDENT_COUNT_PER_TUTORIAL;
  const count = Math.floor(randomNumberBetween(min, max));

  console.group(
    `Creating ${count} students for tutorial #${tutorial.slot.toString().padStart(2, '0')}`
  );

  const promises: Promise<Student>[] = [];

  for (let i = 0; i < count; i++) {
    const idx = Math.random() * MATR_NO.length;
    const matriculationNo: string = MATR_NO.splice(idx, 1)[0];

    console.log(
      `Queing student number ${i
        .toString()
        .padStart(2, '0')} with matriculation number ${matriculationNo}.`
    );

    promises.push(
      createStudent({
        firstname: `student-${i}-${tutorial.slot}`,
        lastname: `student-${i}-${tutorial.slot}`,
        courseOfStudies: 'Informatik',
        email: 'some@mail.sth',
        matriculationNo,
        team: null,
        tutorial: tutorial.id,
      })
    );
  }

  console.groupEnd();

  return Promise.all(promises);
}

async function createSheets(sheetCount: number): Promise<Sheet[]> {
  console.group(`Creating ${sheetCount} sheets...`);
  const { min, max } = EXERCISE_COUNT_PER_SHEET;
  const promises: Promise<Sheet>[] = [];

  for (let sheetNo = 0; sheetNo < sheetCount; sheetNo++) {
    const exercises: ExerciseDTO[] = [];
    const exCount = Math.floor(randomNumberBetween(min, max));

    for (let exNo = 1; exNo <= exCount; exNo++) {
      exercises.push({
        exNo,
        maxPoints: Math.floor(randomNumberBetween(4, 20)),
        bonus: Math.random() < 0.1,
      });
    }

    console.log(`Queing sheet #${sheetNo.toString().padStart(2, '0')} with ${exCount} exercises.`);

    promises.push(
      createSheet({
        sheetNo,
        exercises,
        bonusSheet: Math.random() < 0.05,
      })
    );
  }

  console.groupEnd();
  return Promise.all(promises);
}

async function createScheinExams(examCount: number): Promise<ScheinExam[]> {
  console.group(`Creating ${examCount} schein exams...`);
  const { min, max } = EXERCISE_COUNT_PER_EXAM;
  const promises: Promise<ScheinExam>[] = [];

  for (let scheinExamNo = 1; scheinExamNo <= examCount; scheinExamNo++) {
    const exercises: ExerciseDTO[] = [];
    const exCount = Math.floor(randomNumberBetween(min, max));

    for (let exNo = 1; exNo <= exCount; exNo++) {
      exercises.push({
        exNo,
        maxPoints: Math.floor(randomNumberBetween(4, 40)),
        bonus: false,
      });
    }

    console.log(
      `Queing schein exam #${scheinExamNo.toString().padStart(2, '0')} with ${exCount} exercises.`
    );

    promises.push(
      createScheinExam({
        scheinExamNo,
        exercises,
        date: new Date(Date.now()).toISOString(),
        percentageNeeded: 0.5,
      })
    );
  }

  return Promise.all(promises);
}

async function initDB() {
  const tutorials: Tutorial[] = await createTutorials(TUTORIAL_COUNT);
  const studentPromises: Promise<Student[]>[] = [];

  for (let tutorial of tutorials) {
    addTutorToTutorial(tutorial);

    studentPromises.push(addStudentsToTutorial(tutorial));
  }

  console.log('Waiting on all student requests to finish...');
  const students: Student[] = (await Promise.all(studentPromises)).flat();

  const sheets = await createSheets(SHEET_COUNT);

  const scheinExams = await createScheinExams(SCHEIN_EXAM_COUNT);

  console.group(`DB initialization finished with:`);
  console.log(`${tutorials.length} tutorials`);
  console.log(`${students.length} students`);
  console.log(`${sheets.length} sheets`);
  console.log(`${scheinExams.length} schein examsŒ`);
  console.groupEnd();
}

initDB().catch(e => {
  console.error('Something on initializing the DB went wrong.');
  console.log(e);
});

function randomNumberBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
