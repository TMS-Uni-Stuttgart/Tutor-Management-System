import { isValid, parse } from 'date-fns';
import Router from 'express-promise-router';
import { Role } from 'shared/dist/model/Role';
import {
  checkRoleAccess,
  checkAccess,
  hasUserOneOfRoles,
  isUserTutorOfTutorial,
  isUserCorrectorOfTutorial,
  isUserTutorOfStudent,
  isUserCorrectorOfStudent,
} from '../../middleware/AccessControl';
import { BadRequestError } from '../../model/Errors';
import pdfService from './PdfService.class';
import markdownService from '../markdown-service/MarkdownService.class';

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

pdfRouter.get(
  '/correction/:tutorialId/:sheetId',
  ...checkAccess(hasUserOneOfRoles(Role.ADMIN), isUserTutorOfTutorial, isUserCorrectorOfTutorial),
  async (req, res) => {
    const tutorialId = req.params.tutorialId;
    const sheetId = req.params.sheetId;

    const zipStream = await pdfService.generateZIPFromComments(tutorialId, sheetId);

    res.contentType('zip');
    zipStream.pipe(res);
  }
);

pdfRouter.get(
  '/correction/:tutorialId/:sheetId/:teamId',
  ...checkAccess(hasUserOneOfRoles(Role.ADMIN), isUserTutorOfTutorial, isUserCorrectorOfTutorial),
  async (req, res) => {
    const tutorialId = req.params.tutorialId;
    const teamId = req.params.teamId;
    const sheetId = req.params.sheetId;

    const pdf = await pdfService.generatePDFFromSingleComment(tutorialId, sheetId, teamId);

    res.contentType('pdf');
    res.send(pdf);
  }
);

pdfRouter.get(
  '/markdown/tutorial/:tutorialId/sheet/:sheetId/team/:teamId',
  ...checkAccess(hasUserOneOfRoles(Role.ADMIN), isUserTutorOfTutorial, isUserCorrectorOfTutorial),
  async (req, res) => {
    const tutorialId = req.params.tutorialId;
    const teamId = req.params.teamId;
    const sheetId = req.params.sheetId;

    const markdown = await markdownService.getMarkdownFromTeamComment(tutorialId, teamId, sheetId);

    res.send(markdown);
  }
);

pdfRouter.get(
  '/markdown/sheet/:sheetId/student/:studentId',
  ...checkAccess(hasUserOneOfRoles(Role.ADMIN), isUserTutorOfStudent, isUserCorrectorOfStudent),
  async (req, res) => {
    const studentId = req.params.studentId;
    const sheetId = req.params.sheetId;

    const markdown = await markdownService.getMarkdownFromStudentComment(studentId, sheetId);

    res.send(markdown);
  }
);

export default pdfRouter;
