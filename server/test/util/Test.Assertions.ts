import request = require('superagent');
import { CreateUserDTO, User } from 'shared/dist/model/User';

/**
 * Checks if the response of the API call matches the given CreateUserDTO.
 *
 * This checks all non-array-fields (except `id`) for strict equality (`===`) and array fields for deep-equality using the respecting assertion functions provided by Jest.
 *
 * @param expectedUser User to check response against
 */
export function assertUserToMatchCreateUserDTO(expectedUser: CreateUserDTO) {
  return (res: request.Response) => {
    const body = res.body as User;

    expect(body.firstname).toBe(expectedUser.firstname);
    expect(body.lastname).toBe(expectedUser.lastname);
    expect(body.email).toBe(expectedUser.email);
    expect(body.username).toBe(expectedUser.username);
    expect(body.temporaryPassword).toBe(expectedUser.password);

    expect(body.roles).toEqual(expectedUser.roles);
    expect(body.tutorials).toEqual(expectedUser.tutorials);
    expect(body.tutorialsToCorrect).toEqual(expectedUser.tutorialsToCorrect);
  };
}
