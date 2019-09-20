import Router from 'express-promise-router';
import { Role } from 'shared/dist/model/Role';
import { checkRoleAccess } from '../../middleware/AccessControl';
import mailService from './MailService.class';

const mailRouter = Router();

mailRouter.get('/credentials', ...checkRoleAccess(Role.ADMIN), async (_, res) => {
  await mailService.mailCredentials();

  res.status(204).send();
});

export default mailRouter;
