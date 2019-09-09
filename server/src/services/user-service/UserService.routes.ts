import Router from 'express-promise-router';
import { Role } from 'shared/dist/model/Role';
import { User } from 'shared/dist/model/User';
import { validateAgainstTutorialIdList } from 'shared/dist/validators/Tutorial';
import { validateAgainstCreateUserDTO, validateAgainstUserDTO } from 'shared/dist/validators/User';
import { checkRoleAccess, isTargetedUserSameAsRequestUser } from '../../middleware/AccessControl';
import { validateRequestBody } from '../../middleware/Validation';
import { BadRequestError } from '../../model/Errors';
import userService from './UserService.class';

const userRouter = Router();

userRouter.get('/', ...checkRoleAccess([Role.ADMIN, Role.EMPLOYEE]), async (_, res) => {
  const allUsers: User[] = await userService.getAllUsers();

  res.json(allUsers);
});

userRouter.post(
  '/',
  ...checkRoleAccess(Role.ADMIN),
  validateRequestBody(validateAgainstCreateUserDTO, 'Not a valid CreateUserDTO.'),
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
  isTargetedUserSameAsRequestUser,
  validateRequestBody(validateAgainstUserDTO, 'Not a valid UserDTO.'),
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

userRouter.get(
  '/:id/tutorial',
  ...checkRoleAccess(Role.ADMIN),
  isTargetedUserSameAsRequestUser,
  async (req, res) => {
    const id: string = req.params.id;
    const tutorials = await userService.getTutorialsOfUser(id);

    return res.json(tutorials);
  }
);

userRouter.put(
  '/:id/tutorial',
  ...checkRoleAccess(Role.ADMIN),
  validateRequestBody(
    validateAgainstTutorialIdList,
    'Request body is not a list of valid Tutorial IDs.'
  ),
  async (req, res) => {
    const id: string = req.params.id;
    const tutorials = req.body;

    await userService.setTutorialsOfUser(id, tutorials);

    return res.status(204).send();
  }
);

// TODO: Allow user to edit own password (& tmp password?)
userRouter.post(
  '/:id/password',
  ...checkRoleAccess(Role.ADMIN),
  isTargetedUserSameAsRequestUser,
  async (req, res) => {
    const id = req.params.id;
    const { password } = req.body;

    if (!password) {
      throw new BadRequestError('Request body does not contain a password.');
    }

    await userService.setPasswordOfUser(id, password);

    res.status(204).send();
  }
);

userRouter.post('/:id/temporaryPassword', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const id = req.params.id;
  const { password } = req.body;

  if (!password) {
    throw new BadRequestError('Request body does not contain a password.');
  }

  await userService.setTemporaryPasswordOfUser(id, password);

  res.status(204).send();
});

export default userRouter;
