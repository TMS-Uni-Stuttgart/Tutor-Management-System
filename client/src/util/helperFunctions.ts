import { format } from 'date-fns';
import deLocale from 'date-fns/locale/de';
import { PointMap } from 'shared/dist/model/Points';
import { ScheinExam } from 'shared/dist/model/Scheinexam';
import { Student } from 'shared/dist/model/Student';
import { Team } from 'shared/dist/model/Team';
import { Sheet } from 'shared/dist/model/Sheet';

export function teamItemToString(team: Team): string {
  const studentsInTeam = team.students.length
    ? `(${team.students.map(student => student.lastname).join(', ')})`
    : '(Keine Studierende)';

  return `#${team.teamNo.toString().padStart(2, '0')} ${studentsInTeam}`;
}

export function getDisplayStringForTutorial(tutorial: { slot: string }): string {
  return `Tutorium ${tutorial.slot.padStart(2, '0')}`;
}

export function getDisplayStringOfSheet(sheet: Sheet): string {
  return `Übungsblatt #${sheet.sheetNo.toString().padStart(2, '0')}`;
}

export function getDisplayStringOfScheinExam(exam: ScheinExam): string {
  return `Scheinklausur #${exam.scheinExamNo} (${format(exam.date, 'dd MMM. yyyy', {
    locale: deLocale,
  })})`;
}

export function parseDateToMapKey(date: Date): string {
  return date.toDateString();
}

export function getSumOfPointsOfStudentInScheinExam(
  scheinExamResults: Student['scheinExamResults'],
  exam: ScheinExam
): number {
  return new PointMap(scheinExamResults).getSumOfPoints(exam);
}

export function saveBlob(blob: Blob, filename: string) {
  const link = document.createElement('a');

  link.href = window.URL.createObjectURL(blob);
  link.download = filename;

  document.body.appendChild(link);

  link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  link.remove();

  // This fixes some issues with browser like cutting big PDFs in chunks.
  window.URL.revokeObjectURL(link.href);
}
