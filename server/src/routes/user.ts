import Router from 'express-promise-router';
import { ValidationErrors } from 'shared/dist/model/errors/Errors';
import { Role } from 'shared/dist/model/Role';
import { CreateUserDTO, User, UserDTO } from 'shared/dist/model/User';
import { validateAgainstCreateUserDTO, validateAgainstUserDTO } from 'shared/dist/validators/User';
import { validateAgainstTutorialIdList } from 'shared/dist/validators/Tutorial';
import { checkRoleAccess } from './middleware/AccessControl';
import { handleError } from '../model/Errors';
import userService from '../services/UserService';
import { validateRequestBody } from './middleware/Validation';

function isValidCreateUserDTO(obj: any, errors: ValidationErrors): obj is CreateUserDTO {
  const result = validateAgainstCreateUserDTO(obj);

  if ('errors' in result) {
    errors.push(...result['errors']);
    return false;
  }

  return true;
}

function isValidListOfTutorialIds(obj: any, errors: ValidationErrors): obj is string[] {
  const result = validateAgainstTutorialIdList(obj);

  if ('errors' in result) {
    errors.push(...result['errors']);
    return false;
  }

  return true;
}

function isValidUserDTO(obj: any, errors: ValidationErrors): obj is UserDTO {
  const result = validateAgainstUserDTO(obj);

  if ('errors' in result) {
    errors.push(...result['errors']);
    return false;
  }

  return true;
}

const userRouter = Router();

userRouter.get('/', ...checkRoleAccess([Role.ADMIN, Role.EMPLOYEE]), async (_, res) => {
  const allUsers: User[] = await userService.getAllUsers();

  res.json(allUsers);
});

userRouter.post(
  '/',
  ...checkRoleAccess(Role.ADMIN),
  validateRequestBody(isValidCreateUserDTO, 'Not a valid CreateUserDTO.'),
  async (req, res) => {
    const dto = req.body;
    const user = await userService.createUser(dto);

    return res.status(201).json(user);
  }
);

userRouter.get('/:id', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const id: string = req.params.id;
  const user = await userService.getUserWithId(id);

  res.send(user);
});

userRouter.patch(
  '/:id',
  ...checkRoleAccess(Role.ADMIN),
  validateRequestBody(isValidUserDTO, 'Not a valid UserDTO.'),
  async (req, res) => {
    const dto = req.body;
    const id = req.params.id;
    const user = await userService.updateUser(id, dto);

    return res.status(200).json(user);
  }
);

userRouter.delete('/:id', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const id: string = req.params.id;
  await userService.deleteUser(id);

  res.status(204).send();
});

userRouter.get('/:id/tutorial', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const id: string = req.params.id;
  const tutorials = await userService.getTutorialsOfUser(id);

  return res.json(tutorials);
});

userRouter.put(
  '/:id/tutorial',
  ...checkRoleAccess(Role.ADMIN),
  validateRequestBody(
    isValidListOfTutorialIds,
    'Request body is not a list of valid Tutorial IDs.'
  ),
  async (req, res) => {
    const id: string = req.params.id;
    const tutorials = req.body;

    await userService.setTutorialsOfUser(id, tutorials);

    return res.status(204).send();
  }
);

export default userRouter;
