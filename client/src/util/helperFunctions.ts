import { DateTime } from 'luxon';

export function compareDateTimes(a: DateTime, b: DateTime): number {
  return a.diff(b).milliseconds;
}

export function parseDateToMapKey(date: DateTime): string {
  const dateKey = date.toISODate();

  if (!dateKey) {
    throw new Error(`DATE_NOT_PARSABLE: {date}`);
  }

  return dateKey;
}

export function saveBlob(blob: Blob, filename: string): void {
  const link = document.createElement('a');

  link.href = window.URL.createObjectURL(blob);
  link.download = filename;

  document.body.appendChild(link);

  link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  link.remove();

  // This fixes some issues in browsers like cutting big PDFs in chunks.
  window.URL.revokeObjectURL(link.href);
}
