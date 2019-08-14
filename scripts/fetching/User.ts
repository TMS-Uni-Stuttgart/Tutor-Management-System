import { CreateUserDTO, EditUserDTO, NewPasswordDTO } from '../typings/RequestDTOs';
import { Tutorial, User, Role } from '../typings/ServerResponses';
import { UserWithFetchedTutorials } from '../typings/types';
import { transformMultipleTutorialResponse } from '../util/axiosTransforms';
import axios from './Axios';

export async function getUsers(): Promise<User[]> {
  const response = await axios.get<User[]>('user');

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function getUsersWithRole(role: Role): Promise<User[]> {
  const allUsers = await getUsers();

  return allUsers.filter(u => u.roles.indexOf(role) !== -1);
}

export async function getUsersAndFetchTutorials(): Promise<UserWithFetchedTutorials[]> {
  const users = await getUsers();
  const promises: Promise<UserWithFetchedTutorials>[] = [];

  for (let user of users) {
    promises.push(getTutorialsOfUser(user.id).then(tutorials => ({ ...user, tutorials })));
  }

  return Promise.all(promises);
}

export async function createUser(userInformation: CreateUserDTO): Promise<User> {
  const response = await axios.post<User>('user', userInformation);

  if (response.status === 201) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function createUserAndFetchTutorials(
  userInformation: CreateUserDTO
): Promise<UserWithFetchedTutorials> {
  const user = await createUser(userInformation);
  const tutorials = await getTutorialsOfUser(user.id);

  return { ...user, tutorials };
}

export async function editUser(userid: string, userInformation: EditUserDTO): Promise<User> {
  const response = await axios.patch<User>(`user/${userid}`, userInformation);

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status}).`);
}

export async function editUserAndFetchTutorials(
  userid: string,
  userInformation: EditUserDTO
): Promise<UserWithFetchedTutorials> {
  const user = await editUser(userid, userInformation);
  const tutorials = await getTutorialsOfUser(user.id);

  return { ...user, tutorials };
}

export async function getTutorialsOfUser(userid: string): Promise<Tutorial[]> {
  const response = await axios.get<Tutorial[]>(`user/${userid}/tutorial`, {
    transformResponse: transformMultipleTutorialResponse,
  });

  if (response.status === 200) {
    return response.data;
  }

  return Promise.reject(`Wrong response code (${response.status})`);
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
