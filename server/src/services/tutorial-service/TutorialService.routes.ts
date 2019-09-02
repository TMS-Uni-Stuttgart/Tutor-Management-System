import Router from 'express-promise-router';
import { ValidationErrors } from 'shared/dist/model/errors/Errors';
import { Role } from 'shared/dist/model/Role';
import { Tutorial, TutorialDTO, SubstituteDTO } from 'shared/dist/model/Tutorial';
import { validateAgainstTutorialDTO } from 'shared/dist/validators/Tutorial';
import tutorialService from './TutorialService.class';
import { checkRoleAccess } from '../../middleware/AccessControl';
import { validateRequestBody } from '../../middleware/Validation';
import teamRouter from '../team-service/TeamService.routes';
import { Student } from 'shared/dist/model/Student';
import { User } from 'shared/dist/model/User';

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

tutorialRouter.post(
  '/',
  ...checkRoleAccess(Role.ADMIN),
  validateRequestBody(isValidTutorialDTO, 'Not a valid TutorialDTO.'),
  async (req, res) => {
    const dto = req.body;
    const tutorial = await tutorialService.createTutorial(dto);

    return res.json(tutorial);
  }
);

// TODO: Add access of Tutor to the tutorial.
tutorialRouter.get('/:id', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const id = req.params.id;
  const tutorial = await tutorialService.getTutorialWithID(id);

  return res.json(tutorial);
});

tutorialRouter.patch(
  '/:id',
  ...checkRoleAccess(Role.ADMIN),
  validateRequestBody(isValidTutorialDTO, 'Not a valid TutorialDTO.'),
  async (req, res) => {
    const id = req.params.id;
    const dto = req.body;
    const tutorial = await tutorialService.updateTutorial(id, dto);

    return res.json(tutorial);
  }
);

tutorialRouter.delete('/:id', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const id: string = req.params.id;
  await tutorialService.deleteTutorial(id);

  res.status(204).send();
});

tutorialRouter.get('/:id/student', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const id: string = req.params.id;
  const students: Student[] = await tutorialService.getStudentsOfTutorial(id);

  res.json(students);
});

tutorialRouter.get('/:id/substitute', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const id: string = req.params.id;
  const substitutes: Map<Date, User> = await tutorialService.getSubstitutesOfTutorial(id);

  res.json(substitutes);
});

tutorialRouter.post('/:id/substitute', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const id: string = req.params.id;
  const dto: SubstituteDTO = req.body;

  // TODO: Validation!
  const tutorial = await tutorialService.addSubstituteToTutorial(id, dto);

  res.json(tutorial);
});

tutorialRouter.use('/', teamRouter);

export default tutorialRouter;
