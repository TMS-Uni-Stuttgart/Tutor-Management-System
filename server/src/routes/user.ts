import { Router, Response } from 'express';
import { Role } from 'shared/dist/model/Role';
import { User, CreateUserDTO, UserDTO } from 'shared/dist/model/User';
import {
  validateAgainstCreateUserDTO,
  ValidationErrors,
  validateAgainstUserDTO,
} from 'shared/dist/validators/User';
import { checkRoleAccess } from '../middleware/AccessControl';
import userService from '../services/UserService';

function isValidCreateUserDTO(obj: any, errors: ValidationErrors): obj is CreateUserDTO {
  const result = validateAgainstCreateUserDTO(obj);

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

export class DocumentNotFoundError {
  constructor(readonly message: string) {}
}

class ErrorResponse {
  constructor(readonly status: number, readonly message: string) {}
}

class ValidationErrorResponse extends ErrorResponse {
  constructor(readonly message: string, readonly errors: ValidationErrors) {
    super(400, message);
  }
}

function handleError(err: any, res: Response) {
  if (err instanceof DocumentNotFoundError) {
    return res.status(404).send(new ErrorResponse(404, 'User with that ID was not found.'));
  }

  return res.status(500).send(new ErrorResponse(500, err.message || 'Internal server error.'));
}

const userRouter = Router();

userRouter.get('/', ...checkRoleAccess([Role.ADMIN, Role.EMPLOYEE]), async (_, res) => {
  const allUsers: User[] = await userService.getAllUsers();

  res.json(allUsers);
});

userRouter.post('/', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const dto = req.body;
  const errors: ValidationErrors = [];

  if (!isValidCreateUserDTO(dto, errors)) {
    return res.status(400).send(new ValidationErrorResponse('Not a valid CreateUserDTO.', errors));
  }

  try {
    const user = await userService.createUser(dto);

    return res.status(201).json(user);
  } catch (err) {
    handleError(err, res);
  }
});

userRouter.get('/:id', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const id: string = req.params.id;
  const user = await userService.getUserWithId(id);

  res.send(user);
});

userRouter.patch('/:id', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const dto = req.body;
  const errors: ValidationErrors = [];

  if (!isValidUserDTO(dto, errors)) {
    return res.status(400).send(new ValidationErrorResponse('Not a valid CreateUserDTO.', errors));
  }

  try {
    const id = req.params.id;
    const user = await userService.updateUser(id, dto);

    return res.status(201).json(user);
  } catch (err) {
    handleError(err, res);
  }
});

userRouter.delete('/:id', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  try {
    const id: string = req.params.id;
    await userService.deleteUser(id);

    res.status(204).send();
  } catch {
    res.status(404).send(new ErrorResponse(404, 'User with that ID was not found.'));
  }
});

export default userRouter;
