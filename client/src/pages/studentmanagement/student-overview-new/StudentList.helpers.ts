import _ from 'lodash';
import { ScheincriteriaSummaryByStudents } from 'shared/model/ScheinCriteria';
import { StudentStatus } from 'shared/model/Student';
import { getNameOfEntity, sortByName } from 'shared/util/helpers';
import {
  getScheinCriteriaSummariesOfAllStudentsOfTutorial,
  getScheinCriteriaSummaryOfAllStudents,
} from '../../../hooks/fetching/Scheincriteria';
import { getAllStudents } from '../../../hooks/fetching/Student';
import { getStudentsOfTutorial } from '../../../hooks/fetching/Tutorial';
import { useFetchState } from '../../../hooks/useFetchState';
import { Student } from '../../../model/Student';

export enum StudentSortOption {
  ALPHABETICAL = 'Alphabetisch',
  ACTIVE_FIRST = 'Aktive nach oben',
}

interface UseStudentsForStudentList {
  students: Student[];
  summaries: ScheincriteriaSummaryByStudents;
  isLoading: boolean;
}

interface UseStudentsForStudentListParams {
  tutorialId?: string;
}

function unifyFilterableText(text: string): string {
  return _.deburr(text).toLowerCase();
}

export function useStudentsForStudentList({
  tutorialId,
}: UseStudentsForStudentListParams): UseStudentsForStudentList {
  const { value: students = [], isLoading: isLoadingStudents } = useFetchState({
    fetchFunction: tutorialId ? getStudentsOfTutorial : getAllStudents,
    immediate: true,
    params: [tutorialId ?? ''],
  });
  const { value: summaries = {}, isLoading: isLoadingSummaries } = useFetchState({
    fetchFunction: tutorialId
      ? getScheinCriteriaSummariesOfAllStudentsOfTutorial
      : getScheinCriteriaSummaryOfAllStudents,
    immediate: true,
    params: [tutorialId ?? ''],
  });

  return { students, summaries, isLoading: isLoadingStudents || isLoadingSummaries };
}

export function getFilteredStudents(
  students: Student[],
  filterText: string,
  sortOption: StudentSortOption
): Student[] {
  return students
    .filter((s) => {
      if (!filterText) {
        return true;
      }

      const name = getNameOfEntity(s);

      return unifyFilterableText(name).includes(unifyFilterableText(filterText));
    })
    .sort((a, b) => {
      switch (sortOption) {
        case StudentSortOption.ALPHABETICAL:
          return sortByName(a, b);

        case StudentSortOption.ACTIVE_FIRST:
          if (a.status !== b.status) {
            return a.status === StudentStatus.ACTIVE ? -1 : 1;
          } else {
            return sortByName(a, b);
          }

        default:
          return sortByName(a, b);
      }
    });
}
