import Router from 'express-promise-router';
import { Role } from 'shared/dist/model/Role';
import { ScheinExam } from 'shared/dist/model/Scheinexam';
import { validateAgainstScheinexamDTO } from 'shared/dist/validators/Scheinexam';
import { checkRoleAccess, isAuthenticated } from '../../middleware/AccessControl';
import { validateRequestBody } from '../../middleware/Validation';
import scheinexamService from './ScheinexamService.class';

const scheinexamRouter = Router();

scheinexamRouter.get('/', isAuthenticated, async (_, res) => {
  const exams: ScheinExam[] = await scheinexamService.getAllScheinExams();

  res.json(exams);
});

scheinexamRouter.post(
  '/',
  ...checkRoleAccess(Role.ADMIN),
  validateRequestBody(validateAgainstScheinexamDTO, 'Not a valid ScheinexamDTO.'),
  async (req, res) => {
    const dto = req.body;
    const exam = await scheinexamService.createScheinExam(dto);

    return res.status(201).json(exam);
  }
);

scheinexamRouter.get('/:id', isAuthenticated, async (req, res) => {
  const id = req.params.id;
  const exam = await scheinexamService.getScheinExamWithId(id);

  return res.json(exam);
});

scheinexamRouter.patch(
  '/:id',
  ...checkRoleAccess(Role.ADMIN),
  validateRequestBody(validateAgainstScheinexamDTO, 'Not a valid ScheinexamDTO.'),
  async (req, res) => {
    const id = req.params.id;
    const dto = req.body;
    const exam = await scheinexamService.updateScheinExam(id, dto);

    return res.json(exam);
  }
);

scheinexamRouter.delete('/:id', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const id = req.params.id;
  await scheinexamService.deleteScheinExam(id);

  return res.status(204).send();
});

export default scheinexamRouter;
