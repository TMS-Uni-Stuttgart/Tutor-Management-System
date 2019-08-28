import { Router } from 'express';
import { ValidationErrors } from 'shared/dist/model/errors/Errors';
import { Role } from 'shared/dist/model/Role';
import { TeamDTO } from 'shared/dist/model/Team';
import { validateAgainstTeamDTO } from 'shared/dist/validators/Team';
import { checkRoleAccess } from './middleware/AccessControl';
import { handleError } from '../model/Errors';
import teamService from '../services/TeamService';
import { validateRequestBody } from './middleware/Validation';

function isValidTeamDTO(obj: any, errors: ValidationErrors): obj is TeamDTO {
  const result = validateAgainstTeamDTO(obj);

  if ('errors' in result) {
    errors.push(...result['errors']);
    return false;
  }

  return true;
}

const teamRouter = Router();

teamRouter.get('/:tutorialId/team', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const teams = await teamService.getAllTeams(req.params.tutorialId);

  res.json(teams);
});

teamRouter.post(
  '/:tutorialId/team',
  ...checkRoleAccess(Role.ADMIN),
  validateRequestBody(isValidTeamDTO, 'Not a valid TeamDTO.'),
  async (req, res) => {
    const dto = req.body;
    const tutorialId = req.params.tutorialId;

    try {
      const team = await teamService.createTeam(tutorialId, dto);

      return res.json(team);
    } catch (err) {
      handleError(err, res);
    }
  }
);

teamRouter.get('/:tutorialId/team/:teamId', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  try {
    const tutorialId = req.params.tutorialId;
    const teamId = req.params.teamId;
    const team = await teamService.getTeamWithId(tutorialId, teamId);

    return res.json(team);
  } catch (err) {
    handleError(err, res);
  }
});

teamRouter.patch(
  '/:tutorialId/team/:teamId',
  ...checkRoleAccess(Role.ADMIN),
  validateRequestBody(isValidTeamDTO, 'Not a valid TeamDTO.'),
  async (req, res) => {
    try {
      const tutorialId = req.params.tutorialId;
      const teamId = req.params.teamId;
      const dto = req.body;

      const team = await teamService.updateTeam(tutorialId, teamId, dto);

      return res.json(team);
    } catch (err) {
      handleError(err, res);
    }
  }
);

teamRouter.delete('/:tutorialId/team/:teamId', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  try {
    const tutorialId = req.params.tutorialId;
    const teamId = req.params.teamId;
    await teamService.deleteTeam(tutorialId, teamId);

    res.status(204).send();
  } catch (err) {
    handleError(err, res);
  }
});

export default teamRouter;
