import Router from 'express-promise-router';
import { initScheincriteriaBlueprints } from '../../model/scheincriteria/Scheincriteria';
import { checkRoleAccess } from '../../middleware/AccessControl';
import { Role } from 'shared/dist/model/Role';
import scheincriteriaService from './ScheincriteriaService.class';

initScheincriteriaBlueprints();

const scheincriteriaRouter = Router();

scheincriteriaRouter.get('/form', ...checkRoleAccess(Role.ADMIN), async (_, res) => {
  const formData = await scheincriteriaService.getFormData();

  res.json(formData);
});

export default scheincriteriaRouter;
