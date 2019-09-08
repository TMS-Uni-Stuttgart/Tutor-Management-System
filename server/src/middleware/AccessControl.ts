import { NextFunction, Request, RequestHandler, Response } from 'express';
import { Role } from 'shared/dist/model/Role';

/**
 * Checks if the User of the request is authenticated. If he is NOT than the request is immediatly aborted and a status of 401 is returned.
 *
 * This will NOT manipulate the `req.hasAccess` property.
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
 * Note: The `user` object in the request has to contain a `roles` array. Otherwise a 401 is responded aswell.
 *
 * @param roles Array of all roles (or single role) which have access to the endpoint.
 */
export function checkRoleAccess(roles: Role | Role[]) {
  if (!Array.isArray(roles)) {
    roles = [roles];
  }

  return [isAuthenticated, hasUserOneOfRoles(roles)];
}

/**
 * Checks if the User making the request has read and write access to the User targeted with that request.
 *
 * If any previous request granted access via `req.hasAccess` this function will just call the `next()` function.
 *
 * If there's no user in the request or the user in the request does NOT have an ID than a 401 status is responded.
 *
 * @param req Request object
 * @param res Response object
 * @param next Next function
 *
 * @throws If the `req.params` does NOT have an `id` property an Error is thrown.
 */
export function isTargetedUserSameAsRequestUser(req: Request, res: Response, next: NextFunction) {
  if (req.hasAccess) {
    return next();
  }

  if (!req.user) {
    return res.status(401).send();
  }

  if (!('id' in req.user)) {
    return res.status(401).send();
  }

  if (!req.params.id) {
    throw new Error(
      "hasReadAccessToUser() middleware must only be used in paths which have an 'id' parameter."
    );
  }

  if (req.user.id === req.params.id) {
    req.hasAccess = true;
    return next();
  } else {
    return res.status(401).send();
  }
}

/**
 * Checks if the User of the current request has at least one of the given roles. If the User does NOT have one of these roles the request is rejected and a 401 is returned as response.
 *
 * If the User has any of those roles than the `req.hasAccess` property will be set to `true`.
 *
 * Note: The `user` object in the request has to contain a `roles` array. Otherwise a 401 is responded aswell.
 *
 * @param roles Role(s) to check.
 */
function hasUserOneOfRoles(roles: Role[]): RequestHandler {
  return (req, res, next) => {
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
        req.hasAccess = true;
        return next();
      }
    }

    return res.status(401).send();
  };
}
