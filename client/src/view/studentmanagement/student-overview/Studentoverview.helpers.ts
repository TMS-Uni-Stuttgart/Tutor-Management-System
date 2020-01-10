import _ from 'lodash';
import { getNameOfEntity, sortByName } from 'shared/dist/util/helpers';
import { StudentWithFetchedTeam } from '../../../typings/types';
import { StudentStatus } from 'shared/dist/model/Student';

export enum StudentSortOption {
  ALPHABETICAL = 'Alphabetisch',
  ACTIVE_FIRST = 'Aktive nach oben',
}

function unifyFilterableText(text: string): string {
  return _.deburr(text).toLowerCase();
}

export function getFilteredStudents(
  students: StudentWithFetchedTeam[],
  filterText: string,
  sortOption: StudentSortOption
): StudentWithFetchedTeam[] {
  return students
    .filter(s => {
      if (!filterText) {
        return true;
      }

      const name = getNameOfEntity(s, { lastNameFirst: false });

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
