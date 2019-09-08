import Router from 'express-promise-router';
import { Role } from 'shared/dist/model/Role';
import { validateAgainstTeamDTO } from 'shared/dist/validators/Team';
import { checkRoleAccess } from '../../middleware/AccessControl';
import { validateRequestBody } from '../../middleware/Validation';
import teamService from './TeamService.class';
import { validateAgainstUpdatePointsDTO } from 'shared/dist/validators/Sheet';

const teamRouter = Router();

teamRouter.get('/:tutorialId/team', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const teams = await teamService.getAllTeams(req.params.tutorialId);

  res.json(teams);
});

teamRouter.post(
  '/:tutorialId/team',
  ...checkRoleAccess(Role.ADMIN),
  validateRequestBody(validateAgainstTeamDTO, 'Not a valid TeamDTO.'),
  async (req, res) => {
    const dto = req.body;
    const tutorialId = req.params.tutorialId;
    const team = await teamService.createTeam(tutorialId, dto);

    return res.status(201).json(team);
  }
);

teamRouter.get('/:tutorialId/team/:teamId', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const tutorialId = req.params.tutorialId;
  const teamId = req.params.teamId;
  const team = await teamService.getTeamWithId(tutorialId, teamId);

  return res.json(team);
});

teamRouter.patch(
  '/:tutorialId/team/:teamId',
  ...checkRoleAccess(Role.ADMIN),
  validateRequestBody(validateAgainstTeamDTO, 'Not a valid TeamDTO.'),
  async (req, res) => {
    const tutorialId = req.params.tutorialId;
    const teamId = req.params.teamId;
    const dto = req.body;

    const team = await teamService.updateTeam(tutorialId, teamId, dto);

    return res.json(team);
  }
);

teamRouter.delete('/:tutorialId/team/:teamId', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const tutorialId = req.params.tutorialId;
  const teamId = req.params.teamId;
  await teamService.deleteTeam(tutorialId, teamId);

  res.status(204).send();
});

teamRouter.put(
  '/:tutorialId/team/:teamId/points', // TODO: Renam to /point
  ...checkRoleAccess(Role.ADMIN),
  validateRequestBody(validateAgainstUpdatePointsDTO, 'Not a valid UpdatePointsDTO'),
  async (req, res) => {
    const tutorialId = req.params.tutorialId;
    const teamId = req.params.teamId;
    const dto = req.body;

    await teamService.setPoints(tutorialId, teamId, dto);

    res.status(204).send();
  }
);

export default teamRouter;
