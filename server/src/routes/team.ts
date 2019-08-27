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

teamRouter.get('/tutorial/:tutorialId/team', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const teams = await teamService.getAllTeams(req.params.tutorialId);

  res.json(teams);
});

teamRouter.post(
  '/tutorial/:tutorialId/team',
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

export default teamRouter;
