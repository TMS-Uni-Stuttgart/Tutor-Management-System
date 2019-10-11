import Router from 'express-promise-router';
import { Role } from 'shared/dist/model/Role';
import { checkRoleAccess } from '../../middleware/AccessControl';
import excelService from './ExcelService.class';

const excelRouter = Router();

excelRouter.get('/test', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const excelBuffer = await excelService.generateTestExcel();

  res.contentType('xlsx');
  res.send(excelBuffer);
});

export default excelRouter;
