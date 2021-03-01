import { TutorialInEntity } from '../model/LoggedInUser';

/**
 * Compares the two given tutorials and returns the corresponding number.
 *
 * The comparison takes in three steps:
 * 1. Compare by `weekday` (from monday to sunday)
 * 2. If same weekday: Compare by start time
 * 3. If same start time: Compare by slot name.
 *
 * @param a First tutorial
 * @param b Second tutorial
 *
 * @returns Number that can be used for comparison.
 */
export function compareTutorials(a: TutorialInEntity, b: TutorialInEntity): number {
  if (a.weekday !== b.weekday) {
    return a.weekday - b.weekday;
  }

  if (!a.time.equals(b.time)) {
    return a.time.start > b.time.start ? 1 : -1;
  }

  return a.slot.localeCompare(b.slot);
}
