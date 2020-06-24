import { CSVData, MappedColumns } from '../../ImportUsers.context';
import { Role } from 'shared/model/Role';
import { UserFormState } from '../AdjustImportedUserDataForm';

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
    .map((r) => r.toUpperCase())
    .map((r) => enumRoles.find((role) => r === role))
    .filter(isRole);

  return roles.length > 0 ? roles : defaultRoles;
}

export function convertCSVDataToFormData(data: CSVData, values: MappedColumns): UserFormState {
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
      tutorials: [],
      tutorialsToCorrect: [],
    };
  });

  return userFormState;
}
