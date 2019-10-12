import Router from 'express-promise-router';
import { Role } from 'shared/dist/model/Role';
import { checkRoleAccess } from '../../middleware/AccessControl';
import excelService from './ExcelService.class';

const excelRouter = Router();

excelRouter.get('/test/:id', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const tutorialId = req.params.id;
  const excelBuffer = await excelService.generateXLSXForTutorial(tutorialId);

  res.contentType('xlsx');
  res.send(excelBuffer);
});

export default excelRouter;
