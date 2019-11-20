import _ from 'lodash';
import { getNameOfEntity } from 'shared/dist/util/helpers';
import { StudentWithFetchedTeam } from '../../../typings/types';

function unifyFilterableText(text: string): string {
  return _.deburr(text).toLowerCase();
}

export function getFilteredStudents(
  students: StudentWithFetchedTeam[],
  filterText: string
): StudentWithFetchedTeam[] {
  if (!filterText) {
    return students;
  }

  return students.filter(s => {
    const name = getNameOfEntity(s, { lastNameFirst: false });

    return unifyFilterableText(name).includes(unifyFilterableText(filterText));
  });
}
