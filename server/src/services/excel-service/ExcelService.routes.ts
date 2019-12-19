import Router from 'express-promise-router';
import { Role } from 'shared/dist/model/Role';
import {
  checkAccess,
  hasUserOneOfRoles,
  isUserTutorOfTutorial,
  isUserCorrectorOfTutorial,
} from '../../middleware/AccessControl';
import excelService from './ExcelService.class';

const excelRouter = Router();

excelRouter.get(
  '/tutorial/:id',
  ...checkAccess(hasUserOneOfRoles(Role.ADMIN), isUserTutorOfTutorial, isUserCorrectorOfTutorial),
  async (req, res) => {
    const tutorialId = req.params.id;
    const excelBuffer = await excelService.generateXLSXForTutorial(tutorialId);

    res.contentType('xlsx');
    res.send(excelBuffer);
  }
);

export default excelRouter;
