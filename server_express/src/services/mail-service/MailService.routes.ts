import Router from 'express-promise-router';
import { Role } from 'shared/dist/model/Role';
import { checkRoleAccess } from '../../middleware/AccessControl';
import mailService from './MailService.class';
import { MailingStatus } from 'shared/dist/model/Mail';

const mailRouter = Router();

mailRouter.get('/credentials', ...checkRoleAccess(Role.ADMIN), async (_, res) => {
  const mailingStatus: MailingStatus = await mailService.mailCredentials();

  res.json(mailingStatus);
});

mailRouter.get('/credentials/:userId', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const userId = req.params.userId;
  const mailingStatus: MailingStatus = await mailService.mailSingleCredentials(userId);

  res.json(mailingStatus);
});

export default mailRouter;
