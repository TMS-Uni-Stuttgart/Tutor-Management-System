import { Role } from 'shared/model/Role';
import { CSVData, MappedColumns } from '../../../../components/import-csv/ImportCSV.types';
import { Tutorial } from '../../../../model/Tutorial';
import { UserColumns } from '../../ImportUsers';
import { UserFormState } from '../AdjustImportedUserDataForm';

interface ConversionParams {
  data: CSVData;
  values: MappedColumns<UserColumns>;
  tutorials: Tutorial[];
}

function isRole(role: Role | undefined): role is Role {
  return role !== undefined;
}

function convertColumnToRoles(roleData?: string): Role[] {
  const defaultRoles = [Role.TUTOR];

  if (!roleData) {
    return defaultRoles;
  }

  const enumRoles = Object.values(Role);
  const roles: Role[] = roleData
    .split(',')
    .map((r) => r.trim().toUpperCase())
    .map((r) => enumRoles.find((role) => r === role.toString()))
    .filter(isRole);

  return roles.length > 0 ? roles : defaultRoles;
}

function convertColumnToTutorials(tutorials: Tutorial[], tutorialData?: string): string[] {
  if (!tutorialData) {
    return [];
  }

  const slots: string[] = tutorialData.split(',').map((s) => s.trim());
  const tutorialIds: string[] = [];

  for (const slot of slots) {
    const tutorial = tutorials.find((t) => t.slot === slot);
    if (!!tutorial) {
      tutorialIds.push(tutorial.id);
    }
  }

  return tutorialIds;
}

export function convertCSVDataToFormData(params: ConversionParams): UserFormState {
  const { data, values, tutorials } = params;
  const emptyString = 'N/A';

  const userFormState: UserFormState = {};
  data.rows.forEach(({ rowNr, data }) => {
    const key = rowNr.toString();
    userFormState[key] = {
      rowNr,
      firstname: data[values.firstname] ?? emptyString,
      lastname: data[values.lastname] ?? emptyString,
      email: data[values.email] ?? emptyString,
      roles: convertColumnToRoles(data[values.roles]),
      username: data[values.username],
      password: data[values.password],
      tutorials: convertColumnToTutorials(tutorials, data[values.tutorials]),
      tutorialsToCorrect: convertColumnToTutorials(tutorials, data[values.tutorialsToCorrect]),
    };
  });

  return userFormState;
}
