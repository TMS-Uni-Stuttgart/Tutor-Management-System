import { NamedElement } from 'shared/model/Common';
import { MailingStatus } from 'shared/model/Mail';
import { Role } from 'shared/model/Role';
import { ICreateUserDTO, INewPasswordDTO, IUser, IUserDTO } from 'shared/model/User';
import { sortByName } from 'shared/util/helpers';
import axios from './Axios';

export async function getUsers(): Promise<IUser[]> {
  const response = await axios.get<IUser[]>('user');

  if (response.status === 200) {
    return response.data.sort(sortByName);
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function getUserNames(): Promise<NamedElement[]> {
  const response = await axios.get<NamedElement[]>('user/name/tutor');

  if (response.status === 200) {
    return response.data.sort(sortByName);
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function getUser(id: string): Promise<IUser> {
  const response = await axios.get<IUser>(`user/${id}`);

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function getUsersWithRole(role: Role): Promise<IUser[]> {
  const allUsers = await getUsers();

  return allUsers.filter((u) => u.roles.indexOf(role) !== -1);
}

export async function createUser(userInformation: ICreateUserDTO): Promise<IUser> {
  const response = await axios.post<IUser>('user', userInformation);

  if (response.status === 201) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function createManyUsers(dto: ICreateUserDTO[]): Promise<IUser[]> {
  const response = await axios.post<IUser[]>('user/generate', dto);

  if (response.status === 201) {
    return response.data;
  }

  return Promise.reject((response.data as any).message ?? 'Unbekannter Fehler');
}

export async function editUser(userid: string, userInformation: IUserDTO): Promise<IUser> {
  const response = await axios.patch<IUser>(`user/${userid}`, userInformation);

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function deleteUser(userid: string): Promise<void> {
  const response = await axios.delete(`user/${userid}`);

  if (response.status !== 204) {
    return Promise.reject(`Wrong response code (${response.status}).`);
  }
}

export async function setTemporaryPassword(
  userid: string,
  password: INewPasswordDTO
): Promise<void> {
  const response = await axios.post(`user/${userid}/temporarypassword`, password);

  if (response.status !== 204) {
    return Promise.reject(`Wrong response code (${response.status}).`);
  }
}

export async function sendCredentials(): Promise<MailingStatus> {
  const response = await axios.get<MailingStatus>('mail/credentials');

  if (response.status !== 200) {
    return Promise.reject(`Wrong response code (${response.status}).`);
  } else {
    return response.data;
  }
}

export async function sendCredentialsToSingleUser(userId: string): Promise<MailingStatus> {
  const response = await axios.get<MailingStatus>(`mail/credentials/${userId}`);

  if (response.status !== 200) {
    return Promise.reject(`Wrong response code (${response.status}).`);
  } else {
    return response.data;
  }
}
