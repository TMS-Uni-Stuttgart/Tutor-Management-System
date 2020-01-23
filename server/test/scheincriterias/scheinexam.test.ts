import { PointId, PointMap } from 'shared/dist/model/Points';
import { ScheinExam } from 'shared/dist/model/Scheinexam';
import request from 'supertest';
import scheinexamService from '../../src/services/scheinexam-service/ScheinexamService.class';
import studentService from '../../src/services/student-service/StudentService.class';
import { generateScheinExam } from '../generators/Test.ScheinExam';
import { generateSingleStudent } from '../generators/Test.Students';
import { generateTutorial } from '../generators/Test.Tutorials';
import app from '../util/Test.App';
import { connectToDB, disconnectFromDB } from '../util/Test.connectToDB';

const agent = request.agent(app);

let tutorialId: string = 'NOT_GENERATED_YET';

beforeAll(async done => {
  await connectToDB();

  await agent
    .post('/api/login')
    .send({})
    .auth('admin', 'admin', { type: 'basic' });

  const { id } = await generateTutorial();
  tutorialId = id;

  done();
}, 10 * 60 * 1000);

afterAll(disconnectFromDB);

describe('Student has correctly passed / not passed', () => {
  test('Student has MORE THAN the required points.', async done => {
    const student = await generateSingleStudent({ tutorialId });
    const exam: ScheinExam = await generateScheinExam();
    const points = new PointMap();

    const [firstExercise, secondExercise, thirdExercise] = exam.exercises;

    points.setPointEntry(new PointId(exam.id, firstExercise), {
      comment: '',
      points: {
        [firstExercise.subexercises[0].id]: 9,
        [firstExercise.subexercises[1].id]: 4,
        [firstExercise.subexercises[2].id]: 5,
      },
    });

    points.setPointEntry(new PointId(exam.id, secondExercise), {
      comment: '',
      points: {
        [secondExercise.subexercises[0].id]: 8,
        [secondExercise.subexercises[1].id]: 7,
      },
    });

    points.setPointEntry(new PointId(exam.id, thirdExercise), {
      comment: '',
      points: 18,
    });

    await studentService.setExamResults(student.id, { points: points.toDTO() });

    const studentDoc = await studentService.getDocumentWithId(student.id);
    const examDoc = await scheinexamService.getDocumentWithId(exam.id);

    expect(examDoc.hasPassed(studentDoc)).toBeTruthy();

    done();
  });

  test('Student has EXACTLY the required points.', async done => {
    const student = await generateSingleStudent({ tutorialId });
    const exam: ScheinExam = await generateScheinExam();
    const points = new PointMap();

    const [firstExercise, secondExercise, thirdExercise] = exam.exercises;

    points.setPointEntry(new PointId(exam.id, firstExercise), {
      comment: '',
      points: {
        [firstExercise.subexercises[0].id]: 5,
        [firstExercise.subexercises[1].id]: 2,
        [firstExercise.subexercises[2].id]: 3,
      },
    });

    points.setPointEntry(new PointId(exam.id, secondExercise), {
      comment: '',
      points: {
        [secondExercise.subexercises[0].id]: 5,
        [secondExercise.subexercises[1].id]: 5,
      },
    });

    points.setPointEntry(new PointId(exam.id, thirdExercise), {
      comment: '',
      points: 10,
    });

    await studentService.setExamResults(student.id, { points: points.toDTO() });

    const studentDoc = await studentService.getDocumentWithId(student.id);
    const examDoc = await scheinexamService.getDocumentWithId(exam.id);

    expect(examDoc.hasPassed(studentDoc)).toBeTruthy();

    done();
  });

  test('Studet has LESS THAN the required points.', async done => {
    const student = await generateSingleStudent({ tutorialId });
    const exam: ScheinExam = await generateScheinExam();
    const points = new PointMap();

    const [firstExercise, secondExercise, thirdExercise] = exam.exercises;

    points.setPointEntry(new PointId(exam.id, firstExercise), {
      comment: '',
      points: {
        [firstExercise.subexercises[0].id]: 2,
        [firstExercise.subexercises[1].id]: 1,
        [firstExercise.subexercises[2].id]: 2,
      },
    });

    points.setPointEntry(new PointId(exam.id, secondExercise), {
      comment: '',
      points: {
        [secondExercise.subexercises[0].id]: 0,
        [secondExercise.subexercises[1].id]: 2,
      },
    });

    points.setPointEntry(new PointId(exam.id, thirdExercise), {
      comment: '',
      points: 3,
    });

    await studentService.setExamResults(student.id, { points: points.toDTO() });

    const studentDoc = await studentService.getDocumentWithId(student.id);
    const examDoc = await scheinexamService.getDocumentWithId(exam.id);

    expect(examDoc.hasPassed(studentDoc)).toBeFalsy();

    done();
  });
});
