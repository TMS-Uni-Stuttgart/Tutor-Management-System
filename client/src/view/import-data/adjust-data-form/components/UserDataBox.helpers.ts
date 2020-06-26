import { CSVData, MappedColumns } from '../../ImportUsers.context';
import { Role } from 'shared/model/Role';
import { UserFormState } from '../AdjustImportedUserDataForm';
import { Tutorial } from '../../../../model/Tutorial';

interface ConversionParams {
  data: CSVData;
  values: MappedColumns;
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
      firstname: data[values.firstnameColumn] ?? emptyString,
      lastname: data[values.lastnameColumn] ?? emptyString,
      email: data[values.emailColumn] ?? emptyString,
      roles: convertColumnToRoles(data[values.rolesColumn]),
      username: data[values.usernameColumn],
      password: data[values.passwordColumn],
      tutorials: convertColumnToTutorials(tutorials, data[values.tutorialsColumn]),
      tutorialsToCorrect: convertColumnToTutorials(
        tutorials,
        data[values.tutorialsToCorrectColumn]
      ),
    };
  });

  return userFormState;
}
