import { Router } from 'express';
import { isAuthenticated, checkRoleAccess } from '../middleware/AccessControl';
import userService from '../services/UserService';
import { User } from 'shared/dist/model/User';
import { Role } from 'shared/dist/model/Role';

const userRouter = Router();

userRouter.get('/', ...checkRoleAccess(Role.ADMIN), async (_, res) => {
  const allUsers: User[] = await userService.getAllUsers();

  res.json(allUsers);
});

export default userRouter;
