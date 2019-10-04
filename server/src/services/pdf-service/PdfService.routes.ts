import { isValid, parse } from 'date-fns';
import Router from 'express-promise-router';
import { Role } from 'shared/dist/model/Role';
import { checkRoleAccess } from '../../middleware/AccessControl';
import { BadRequestError } from '../../model/Errors';
import pdfService from './PdfService.class';

const pdfRouter = Router();

pdfRouter.get(
  '/attendance/:id/:date',
  ...checkRoleAccess([Role.ADMIN, Role.CORRECTOR, Role.TUTOR]),
  async (req, res) => {
    const tutorialId = req.params.id;
    const date = parse(req.params.date, 'yyyy-MM-dd', Date.now());

    if (!isValid(date)) {
      throw new BadRequestError('Given date string is not a date in the format yyyy-MM-dd.');
    }

    const pdfBuffer = await pdfService.generateAttendancePDF(tutorialId, date);

    res.contentType('pdf');
    res.send(pdfBuffer);
  }
);

pdfRouter.get('/scheinstatus', ...checkRoleAccess(Role.ADMIN), async (_, res) => {
  const pdfBuffer = await pdfService.generateStudentScheinOverviewPDF();

  res.contentType('pdf');
  res.send(pdfBuffer);
});

pdfRouter.get('/credentials', ...checkRoleAccess(Role.ADMIN), async (_, res) => {
  const pdfBuffer = await pdfService.generateCredentialsPDF();

  res.contentType('pdf');
  res.send(pdfBuffer);
});

export default pdfRouter;
