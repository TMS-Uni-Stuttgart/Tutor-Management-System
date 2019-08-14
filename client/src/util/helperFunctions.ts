import { format } from 'date-fns';
import deLocale from 'date-fns/locale/de';
import { ScheinExam } from '../typings/RatingModel';
import { NamedElement, Student } from '../typings/ServerResponses';

interface NameOptions {
  lastNameFirst: boolean;
}

export function getNameOfEntity(entity: NamedElement, options: Partial<NameOptions> = {}): string {
  if (options.lastNameFirst) {
    return `${entity.lastname}, ${entity.firstname} `;
  } else {
    return `${entity.firstname} ${entity.lastname}`;
  }
}

export function getDisplayStringForTutorial(tutorial: { slot: number }): string {
  return `Tutorium #${tutorial.slot.toString().padStart(2, '0')}`;
}

export function getDisplayStringOfScheinExam(exam: ScheinExam): string {
  return `Scheinklausur #${exam.scheinExamNo} (${format(exam.date, 'dd MMM. yyyy', {
    locale: deLocale,
  })})`;
}

export function parseDateToMapKey(date: Date): string {
  // Cut the milliseconds from the ISO string bc the server does not use the milliseconds in keys for maps.
  return date.toISOString().replace(/\.[0-9]{3}/, '');
}

export function getSumOfPointsOfStudentInScheinExam(
  scheinExamResults: Student['scheinExamResults'],
  examId: string
): number {
  return Object.entries(scheinExamResults)
    .filter(([key]) => key.includes(examId))
    .reduce((prev, [, points]) => prev + points, 0);
}
