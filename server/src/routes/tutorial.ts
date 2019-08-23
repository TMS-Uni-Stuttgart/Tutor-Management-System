import { Router } from 'express';
import { ValidationErrors } from 'shared/dist/model/errors/Errors';
import { Role } from 'shared/dist/model/Role';
import { validateAgainstTutorialDTO } from 'shared/dist/validators/Tutorial';
import { checkRoleAccess } from '../middleware/AccessControl';
import { TutorialDTO, Tutorial } from 'shared/dist/model/Tutorial';
import tutorialService from '../services/TutorialService';
import { ValidationErrorResponse, handleError } from '../model/Errors';

function isValidTutorialDTO(obj: any, errors: ValidationErrors): obj is TutorialDTO {
  const result = validateAgainstTutorialDTO(obj);

  if ('errors' in result) {
    errors.push(...result['errors']);
    return false;
  }

  return true;
}

const tutorialRouter = Router();

tutorialRouter.get('/', ...checkRoleAccess([Role.ADMIN, Role.EMPLOYEE]), async (_, res) => {
  const tutorials: Tutorial[] = await tutorialService.getAllTutorials();

  return res.json(tutorials);
});

tutorialRouter.post('/', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const dto = req.body;
  const errors: ValidationErrors = [];

  if (!isValidTutorialDTO(dto, errors)) {
    return res.status(400).send(new ValidationErrorResponse('Not a valid TutorialDTO', errors));
  }

  try {
    const tutorial = await tutorialService.createTutorial(dto);

    return res.json(tutorial);
  } catch (err) {
    handleError(err, res);
  }
});

// TODO: Add access of Tutor to the tutorial.
tutorialRouter.get('/:id', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const id = req.params.id;
  const tutorial = await tutorialService.getTutorialWithID(id);

  return res.json(tutorial);
});

tutorialRouter.patch('/:id', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const id = req.params.id;
  const dto = req.body;
  const errors: ValidationErrors = [];

  if (!isValidTutorialDTO(dto, errors)) {
    return res.status(400).send(new ValidationErrorResponse('Not a vliad TutorialDTO', errors));
  }

  try {
    const tutorial = await tutorialService.updateTutorial(id, dto);

    return res.json(tutorial);
  } catch (err) {
    handleError(err, res);
  }
});

tutorialRouter.delete('/:id', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  try {
    const id: string = req.params.id;
    await tutorialService.deleteTutorial(id);

    res.status(204).send();
  } catch (err) {
    handleError(err, res);
  }
});

export default tutorialRouter;
