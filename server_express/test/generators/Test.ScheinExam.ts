import { ScheinExam } from 'shared/dist/model/Scheinexam';
import scheinexamService from '../../src/services/scheinexam-service/ScheinexamService.class';

/**
 * Adds a scheinexam to the database with 3 exercises which have 20 points each (so 60 pts in total). The required percentage to pass is set to 50%.
 *
 * The exercises are structured as follow:
 *
 * Exercise 1
 * - a) 10 pts
 * - b) 4 pts
 * - c) 6 pts
 *
 * Exercise 2
 * - a) 10 pts
 * - b) 10 pts
 *
 * Exercise 3
 * - 20 pts, no subexercises
 */
export async function generateScheinExam(): Promise<ScheinExam> {
  return scheinexamService.createScheinExam({
    scheinExamNo: 1,
    percentageNeeded: 0.5,
    date: new Date().toDateString(),
    exercises: [
      {
        exName: 'Exercise 1',
        bonus: false,
        maxPoints: 0,
        subexercises: [
          {
            exName: 'Sub 1',
            bonus: false,
            maxPoints: 10,
            subexercises: [],
          },
          {
            exName: 'Sub 2',
            bonus: false,
            maxPoints: 4,
            subexercises: [],
          },
          {
            exName: 'Sub 3',
            bonus: false,
            maxPoints: 6,
            subexercises: [],
          },
        ],
      },
      {
        exName: 'Exercise 2',
        bonus: false,
        maxPoints: 0,
        subexercises: [
          {
            exName: 'Sub 1',
            bonus: false,
            maxPoints: 10,
            subexercises: [],
          },
          {
            exName: 'Sub 2',
            bonus: false,
            maxPoints: 10,
            subexercises: [],
          },
        ],
      },
      {
        exName: 'Exercise 3',
        bonus: false,
        maxPoints: 20,
        subexercises: [],
      },
    ],
  });
}
