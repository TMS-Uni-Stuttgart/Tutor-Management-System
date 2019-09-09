import Router from 'express-promise-router';
import { Role } from 'shared/dist/model/Role';
import { validateAgainstTeamDTO } from 'shared/dist/validators/Team';
import {
  checkRoleAccess,
  checkAccess,
  hasUserOneOfRoles,
  isUserTutorOfTutorial,
  isUserSubstituteOfTutorial,
  isUserCorrectorOfTutorial,
} from '../../middleware/AccessControl';
import { validateRequestBody } from '../../middleware/Validation';
import teamService from './TeamService.class';
import { validateAgainstUpdatePointsDTO } from 'shared/dist/validators/Sheet';

const teamRouter = Router();

teamRouter.get(
  '/:id/team',
  ...checkAccess(
    hasUserOneOfRoles([Role.ADMIN, Role.EMPLOYEE]),
    isUserTutorOfTutorial,
    isUserSubstituteOfTutorial,
    isUserCorrectorOfTutorial
  ),
  async (req, res) => {
    const teams = await teamService.getAllTeams(req.params.id);

    res.json(teams);
  }
);

teamRouter.post(
  '/:id/team',
  ...checkAccess(hasUserOneOfRoles([Role.ADMIN, Role.EMPLOYEE]), isUserTutorOfTutorial),
  validateRequestBody(validateAgainstTeamDTO, 'Not a valid TeamDTO.'),
  async (req, res) => {
    const dto = req.body;
    const tutorialId = req.params.id;
    const team = await teamService.createTeam(tutorialId, dto);

    return res.status(201).json(team);
  }
);

teamRouter.get(
  '/:id/team/:teamId',
  ...checkAccess(
    hasUserOneOfRoles([Role.ADMIN, Role.EMPLOYEE]),
    isUserTutorOfTutorial,
    isUserSubstituteOfTutorial,
    isUserCorrectorOfTutorial
  ),
  async (req, res) => {
    const tutorialId = req.params.id;
    const teamId = req.params.teamId;
    const team = await teamService.getTeamWithId(tutorialId, teamId);

    return res.json(team);
  }
);

teamRouter.patch(
  '/:id/team/:teamId',
  ...checkAccess(hasUserOneOfRoles([Role.ADMIN, Role.EMPLOYEE]), isUserTutorOfTutorial),
  validateRequestBody(validateAgainstTeamDTO, 'Not a valid TeamDTO.'),
  async (req, res) => {
    const tutorialId = req.params.id;
    const teamId = req.params.teamId;
    const dto = req.body;

    const team = await teamService.updateTeam(tutorialId, teamId, dto);

    return res.json(team);
  }
);

teamRouter.delete(
  '/:id/team/:teamId',
  ...checkAccess(hasUserOneOfRoles([Role.ADMIN, Role.EMPLOYEE]), isUserTutorOfTutorial),
  async (req, res) => {
    const tutorialId = req.params.id;
    const teamId = req.params.teamId;
    await teamService.deleteTeam(tutorialId, teamId);

    res.status(204).send();
  }
);

teamRouter.put(
  '/:id/team/:teamId/points', // TODO: Renam to /point
  ...checkAccess(hasUserOneOfRoles(Role.ADMIN), isUserTutorOfTutorial, isUserCorrectorOfTutorial),
  validateRequestBody(validateAgainstUpdatePointsDTO, 'Not a valid UpdatePointsDTO'),
  async (req, res) => {
    const tutorialId = req.params.id;
    const teamId = req.params.teamId;
    const dto = req.body;

    await teamService.setPoints(tutorialId, teamId, dto);

    res.status(204).send();
  }
);

export default teamRouter;
