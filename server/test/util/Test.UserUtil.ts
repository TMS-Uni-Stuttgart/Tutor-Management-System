import { CreateUserDTO, User } from 'shared/dist/model/User';

export function generateExpectedUserFromCreateUserDTO(createdUser: CreateUserDTO): User {
  return {
    id: 'GENERIC_ID',
    firstname: createdUser.firstname,
    lastname: createdUser.lastname,
    roles: [...createdUser.roles],
    email: createdUser.email,
    username: createdUser.username,
    temporaryPassword: createdUser.password,
    tutorials: [],
    tutorialsToCorrect: [],
  };
}
