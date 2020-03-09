import { DateTime } from 'luxon';

// TODO: Move in tutorial class.
export function getDisplayStringForTutorial(tutorial: { slot: string }): string {
  return `Tutorium ${tutorial.slot.padStart(2, '0')}`;
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
