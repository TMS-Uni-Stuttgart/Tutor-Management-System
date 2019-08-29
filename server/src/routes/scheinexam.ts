import { Router } from 'express';
import { ValidationErrors } from 'shared/dist/model/errors/Errors';
import { Role } from 'shared/dist/model/Role';
import { checkRoleAccess } from './middleware/AccessControl';
import { ScheinExamDTO, ScheinExam } from 'shared/dist/model/Scheinexam';
import scheinexamService from '../services/ScheinexamService';
import { validateAgainstScheinexamDTO } from 'shared/dist/validators/Scheinexam';
import { validateRequestBody } from './middleware/Validation';
import { handleError } from '../model/Errors';

function isValidScheinexamDTO(obj: any, errors: ValidationErrors): obj is ScheinExamDTO {
  const result = validateAgainstScheinexamDTO(obj);

  if ('errors' in result) {
    errors.push(...result['errors']);
    return false;
  }

  return true;
}

const scheinexamRouter = Router();

scheinexamRouter.get('/', ...checkRoleAccess(Role.ADMIN), async (_, res) => {
  const exams: ScheinExam[] = await scheinexamService.getAllScheinExams();

  res.json(exams);
});

scheinexamRouter.post(
  '/',
  ...checkRoleAccess(Role.ADMIN),
  validateRequestBody(isValidScheinexamDTO, 'Not a valid ScheinexamDTO.'),
  async (req, res) => {
    try {
      const dto = req.body;
      const exam = await scheinexamService.createScheinExam(dto);

      return res.json(exam);
    } catch (err) {
      handleError(err, res);
    }
  }
);

scheinexamRouter.get('/:id', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  try {
    const id = req.params.id;
    const exam = await scheinexamService.getScheinExamWithId(id);

    return res.json(exam);
  } catch (err) {
    handleError(err, res);
  }
});

scheinexamRouter.patch(
  '/:id',
  ...checkRoleAccess(Role.ADMIN),
  validateRequestBody(isValidScheinexamDTO, 'Not a valid ScheinexamDTO.'),
  async (req, res) => {
    try {
      const id = req.params.id;
      const dto = req.body;
      const exam = await scheinexamService.updateScheinExam(id, dto);

      return res.json(exam);
    } catch (err) {
      handleError(err, res);
    }
  }
);

scheinexamRouter.delete('/:id', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  try {
    const id = req.params.id;
    await scheinexamService.deleteScheinExam(id);

    return res.status(204).send();
  } catch (err) {
    handleError(err, res);
  }
});

export default scheinexamRouter;
