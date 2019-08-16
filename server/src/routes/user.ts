import { Router } from 'express';
import { Role } from 'shared/dist/model/Role';
import { User, CreateUserDTO } from 'shared/dist/model/User';
import { validateAgainstCreateUserDTO, ValidationErrors } from 'shared/dist/validators/User';
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

class ErrorResponse {
  constructor(readonly status: number, readonly message: string) {}
}
class ValidationErrorResponse extends ErrorResponse {
  constructor(readonly message: string, readonly errors: ValidationErrors) {
    super(400, message);
  }
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
  } catch {
    return res.status(400).send(new ErrorResponse(400, 'Could not create the User.'));
  }
});

export default userRouter;
