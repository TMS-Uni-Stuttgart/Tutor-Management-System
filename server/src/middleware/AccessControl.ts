import { NextFunction, Request, Response } from 'express';
import { Role } from 'shared/dist/model/Role';

/**
 * Checks if the User of the request is authenticated. If he is NOT than the request is immediatly aborted and a status of 401 is returned.
 *
 * @param req Request made
 * @param res Response object
 * @param next Next function
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).send();
  }
}

/**
 * Checks if the user is logged in and if one of his/her roles match the one(s) passed to this function. If any of the premises is FALSE then a 401 is responded and the request is therefore canceled.
 *
 * Note: The user object in the request has to contain a `roles` array. Otherwise a 401 is responded aswell.
 *
 * @param roles Array of all roles (or single role) which have access to the endpoint.
 */
export function checkRoleAccess(roles: Role | Role[]) {
  if (!Array.isArray(roles)) {
    roles = [roles];
  }

  return [
    isAuthenticated,

    (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).send();
      }

      if (!('roles' in req.user)) {
        return res.status(401).send();
      }

      const userRoles: unknown = req.user['roles'];

      if (!Array.isArray(userRoles)) {
        return res.status(401).send();
      }

      for (const role of roles) {
        if (userRoles.includes(role)) {
          return next();
        }
      }

      return res.status(401).send();
    },
  ];
}
