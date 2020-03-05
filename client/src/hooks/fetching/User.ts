import { MailingStatus } from 'shared/model/Mail';
import { Role } from 'shared/model/Role';
import { ICreateUserDTO, IUserDTO, NewPasswordDTO, User } from 'shared/model/User';
import { sortByName } from 'shared/util/helpers';
import axios from './Axios';

export async function getUsers(): Promise<User[]> {
  const response = await axios.get<User[]>('user');

  if (response.status === 200) {
    return response.data.sort(sortByName);
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function getUser(id: string): Promise<User> {
  const response = await axios.get<User>(`user/${id}`);

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function getUsersWithRole(role: Role): Promise<User[]> {
  const allUsers = await getUsers();

  return allUsers.filter(u => u.roles.indexOf(role) !== -1);
}

export async function createUser(userInformation: ICreateUserDTO): Promise<User> {
  const response = await axios.post<User>('user', userInformation);

  if (response.status === 201) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function editUser(userid: string, userInformation: IUserDTO): Promise<User> {
  const response = await axios.patch<User>(`user/${userid}`, userInformation);

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
  password: NewPasswordDTO
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
