import { CreateUserDTO, UserDTO, User } from 'shared/dist/model/User';
import { Role } from 'shared/dist/model/Role';

/**
 * Checks if the response of the API call matches the given CreateUserDTO.
 *
 * The assertion first check if the response body is neither `undefined`  nor `null`.
 *
 * This checks all non-array-fields (except `id`) for strict equality (`===`) and array fields for deep-equality using the respecting assertion functions provided by Jest.
 *
 * @param expectedUser User to check response against
 */
export function assertUserToMatchCreateUserDTO(expectedUser: CreateUserDTO, actualUser: User) {
  assertNotUndefinedOrNull(actualUser);

  assertUserToMatchUserDTO(expectedUser, actualUser);

  expect(actualUser.temporaryPassword).toBe(expectedUser.password);
}

export function assertUserToMatchUserDTO(expectedUser: UserDTO, actualUser: User) {
  assertNotUndefinedOrNull(actualUser);

  expect(actualUser.firstname).toBe(expectedUser.firstname);
  expect(actualUser.lastname).toBe(expectedUser.lastname);
  expect(actualUser.email).toBe(expectedUser.email);
  expect(actualUser.username).toBe(expectedUser.username);

  sortArraysInUser(actualUser);
  sortArraysInUser(expectedUser);

  expect(actualUser.roles).toEqual(expectedUser.roles);
  expect(actualUser.tutorials).toEqual(expectedUser.tutorials);
  expect(actualUser.tutorialsToCorrect).toEqual(expectedUser.tutorialsToCorrect);
}

/**
 * Checks that the given object is neither `undefined` nor `null`.
 *
 * @param obj Object to check
 */
export function assertNotUndefinedOrNull(obj: any) {
  expect(obj).not.toBeUndefined();
  expect(obj).not.toBeNull();
}

function sortArraysInUser(user: User | UserDTO) {
  user.roles.sort((a, b) => a.localeCompare(b));
  user.tutorials.sort((a, b) => a.localeCompare(b));
  user.tutorialsToCorrect.sort((a, b) => a.localeCompare(b));
}
