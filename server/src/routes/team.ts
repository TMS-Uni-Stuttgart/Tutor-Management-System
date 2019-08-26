import { Router } from 'express';
import { ValidationErrors } from 'shared/dist/model/errors/Errors';
import { Role } from 'shared/dist/model/Role';
import { checkRoleAccess } from '../middleware/AccessControl';
import { TeamDTO } from 'shared/dist/model/Team';
import teamService from '../services/TeamService';
import { handleError } from '../model/Errors';

function isValidTeamDTO(obj: any, errors: ValidationErrors): obj is TeamDTO {
  throw new Error('Not implemented yet');
}

const teamRouter = Router();

teamRouter.get('/tutorial/:tutorialId/team', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const teams = await teamService.getAllTeams(req.params.tutorialId);

  res.json(teams);
});

teamRouter.post('/tutorial/:tutorialId/team', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const dto = req.body;
  const tutorialId = req.params.tutorialId;

  // TODO: Validation!

  try {
    const team = await teamService.createTeam(tutorialId, dto);

    return res.json(team);
  } catch (err) {
    handleError(err, res);
  }
});

export default teamRouter;
