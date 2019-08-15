import { Router } from 'express';
import { isAuthenticated } from '../middleware/AccessControl';
import userService from '../services/UserService';
import { User } from 'shared/dist/model/User';

const userRouter = Router();

userRouter.get('/', isAuthenticated, async (req, res) => {
  const allUsers: User[] = [];

  res.json(allUsers);
});

export default userRouter;
