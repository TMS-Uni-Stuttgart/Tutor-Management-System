import { format } from 'date-fns';
import deLocale from 'date-fns/locale/de';
import { PointMap } from 'shared/model/Points';
import { IScheinExam } from 'shared/model/Scheinexam';
import { IStudent } from 'shared/model/Student';
import { ITeam } from 'shared/model/Team';
import { ISheet } from 'shared/model/Sheet';

export function teamItemToString(team: ITeam): string {
  const studentsInTeam = team.students.length
    ? `(${team.students.map(student => student.lastname).join(', ')})`
    : '(Keine Studierende)';

  return `#${team.teamNo.toString().padStart(2, '0')} ${studentsInTeam}`;
}

export function getDisplayStringForTutorial(tutorial: { slot: string }): string {
  return `Tutorium ${tutorial.slot.padStart(2, '0')}`;
}

export function getDisplayStringOfSheet(sheet: ISheet): string {
  return `Übungsblatt #${sheet.sheetNo.toString().padStart(2, '0')}`;
}

export function getDisplayStringOfScheinExam(exam: IScheinExam): string {
  return `Scheinklausur #${exam.scheinExamNo} (${format(exam.date, 'dd MMM. yyyy', {
    locale: deLocale,
  })})`;
}

export function parseDateToMapKey(date: Date): string {
  return date.toDateString();
}

export function getSumOfPointsOfStudentInScheinExam(
  scheinExamResults: IStudent['scheinExamResults'],
  exam: IScheinExam
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
