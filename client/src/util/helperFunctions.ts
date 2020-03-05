import { DateTime } from 'luxon';
import { Scheinexam } from '../model/Scheinexam';
import { Sheet } from '../model/Sheet';
import { Team } from '../model/Team';

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

export function getDisplayStringOfScheinExam(exam: Scheinexam): string {
  return `Scheinklausur #${exam.scheinExamNo} (${exam.date.toLocaleString(DateTime.DATE_MED)})`;
}

export function compareDateTimes(a: DateTime, b: DateTime): number {
  return a.diff(b).milliseconds;
}

export function parseDateToMapKey(date: DateTime): string {
  return date.toISODate();
}

export function saveBlob(blob: Blob, filename: string) {
  const link = document.createElement('a');

  link.href = window.URL.createObjectURL(blob);
  link.download = filename;

  document.body.appendChild(link);

  link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  link.remove();

  // This fixes some issues in browsers like cutting big PDFs in chunks.
  window.URL.revokeObjectURL(link.href);
}
