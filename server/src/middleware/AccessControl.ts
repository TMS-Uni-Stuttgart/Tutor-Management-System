import { NextFunction, Request, RequestHandler, Response } from 'express';
import { Role } from 'shared/dist/model/Role';
import { getIdOfDocumentRef } from '../helpers/documentHelpers';
import { TutorialDocument } from '../model/documents/TutorialDocument';
import { PermissionDeniedError } from '../model/Errors';
import tutorialService from '../services/tutorial-service/TutorialService.class';

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
 * Check if the User in the request has access to the endpoint after running all given middleware functions.
 *
 * Please note that the first middleware which will get executed is ALWAYS the `isAuthenticated` access control function.
 *
 * If the user has no access in the end a `PermissionDeniedError` will be thrown.
 *
 * @param handlers Middleware functions to run.
 */
export function checkAccess(...handlers: RequestHandler[]): RequestHandler[] {
  return [
    isAuthenticated,
    ...handlers,
    (req, _, next) => {
      if (!req.hasAccess) {
        throw new PermissionDeniedError('No access granted during access middleware run.');
      }

      next();
    },
  ];
}

/**
 * Checks if the user is logged in and if one of his/her roles match the one(s) passed to this function. If any of the premises is FALSE then a 401 is responded and the request is therefore canceled.
 *
 * Shortcut for `checkAccess(hasUserOneOfRoles(roles))`.
 *
 * Note: The `user` object in the request has to contain a `roles` array. Otherwise an `PermissionDeniedError` is thrown.
 *
 * @param roles Array of all roles (or single role) which have access to the endpoint.
 */
export function checkRoleAccess(roles: Role | Role[]) {
  if (!Array.isArray(roles)) {
    roles = [roles];
  }

  return checkAccess(hasUserOneOfRoles(roles));
}

/**
 * Checks if the User making the request has read and write access to the User targeted with that request.
 *
 * If any previous request granted access via `req.hasAccess` this function will just call the `next()` function.
 *
 * If there's no user in the request or the user in the request does NOT have an ID than an `PermissionDeniedError` is thrown.
 *
 * @param req Request object
 * @param res Response object
 * @param next Next function
 *
 * @throws If the `req.params` does NOT have an `id` property an Error is thrown.
 */
export function isTargetedUserSameAsRequestUser(req: Request, _: Response, next: NextFunction) {
  assertRequestHasIdParam(req, 'isTargetedUserSameAsRequestUser()');

  if (req.hasAccess) {
    return next();
  }

  const userId = assertUserWithIdInRequest(req);

  if (userId === req.params.id) {
    req.hasAccess = true;
  }

  next();
}

/**
 * Checks if the user in the request is the tutor of the targeted tutorial.
 *
 * This middleware must only be used on paths with an `id` parameter in it or else an `Error` will be thrown.
 *
 * If the user in the request is the tutor of the tutorial than `req.hasAccess` will be set to `true`.
 *
 * @param req Request object
 * @param res Response object (not used)
 * @param next Next function
 */
export async function isUserTutorOfTutorial(req: Request, _: Response, next: NextFunction) {
  assertRequestHasIdParam(req, 'isUserTutorOfTutorial()');

  if (req.hasAccess) {
    return next();
  }

  const userId = assertUserWithIdInRequest(req);
  const tutorial = await getTutorialFromRequest(req);

  if (tutorial.tutor && getIdOfDocumentRef(tutorial.tutor) === userId) {
    req.hasAccess = true;
  }

  req.tutorial = tutorial;
  next();
}

/**
 * Checks if the user in the request is a substitute of the targeted tutorial.
 *
 * This middleware must only be used on paths with an `id` parameter in it or else an `Error` will be thrown.
 *
 * If the user in the request is a substitute tutor of the tutorial than `req.hasAccess` will be set to `true`.
 *
 * @param req Request object
 * @param res Response object (not used)
 * @param next Next function
 */
export async function isUserSubstituteOfTutorial(req: Request, _: Response, next: NextFunction) {
  assertRequestHasIdParam(req, 'isUserSubstituteOfTutorial()');

  const userId = assertUserWithIdInRequest(req);
  const tutorial = await getTutorialFromRequest(req);

  if (tutorial.substitutes) {
    tutorial.substitutes.forEach(subst => {
      if (subst === userId) {
        req.hasAccess = true;
      }
    });
  }

  req.tutorial = tutorial;
  next();
}

/**
 * Checks if the user in the request is a corrector of the targeted tutorial.
 *
 * This middleware must only be used on paths with an `id` parameter in it or else an `Error` will be thrown.
 *
 * If the user in the request is a corrector of the tutorial than `req.hasAccess` will be set to `true`.
 *
 * @param req Request object
 * @param res Response object (not used)
 * @param next Next function
 */
export async function isUserCorrectorOfTutorial(req: Request, _: Response, next: NextFunction) {
  assertRequestHasIdParam(req, 'isUserCorrectorOfTutorial()');

  const userId = assertUserWithIdInRequest(req);
  const tutorial = await getTutorialFromRequest(req);

  if (tutorial.correctors.findIndex(corr => getIdOfDocumentRef(corr) === userId) > -1) {
    req.hasAccess = true;
  }

  next();
}

/**
 * Checks if the User of the current request has at least one of the given roles. If the User does NOT have one of these roles the request is rejected and a 401 is returned as response.
 *
 * If the User has any of those roles than the `req.hasAccess` property will be set to `true`.
 *
 * Note: The `user` object in the request has to contain a `roles` array. Otherwise an `PermissionDeniedError` is thrown..
 *
 * @param roles Role(s) to check.
 */
export function hasUserOneOfRoles(roles: Role | Role[]): RequestHandler {
  return (req, _, next) => {
    const userRoles: Role[] = assertUserWithRolesInRequest(req);

    if (!Array.isArray(roles)) {
      roles = [roles];
    }

    for (const role of roles) {
      if (userRoles.includes(role)) {
        req.hasAccess = true;
        break;
      }
    }

    return next();
  };
}

async function getTutorialFromRequest(req: Request): Promise<TutorialDocument> {
  const tutorialId = req.params.id;
  const tutorial = req.tutorial
    ? req.tutorial
    : await tutorialService.getDocumentWithID(tutorialId);

  return tutorial;
}

/**
 * Returns the ID property of the user in the request if possbile.
 *
 * Checks if the request contains a user and if that user has an `id` property.
 *
 * If any of the above preconditions is false a `PermissionDeniedError` is thrown.
 *
 * @param req Request to check
 */
function assertUserWithIdInRequest(req: Request): string {
  if (!req.user) {
    throw new PermissionDeniedError('No user in given request.');
  }

  if (!('id' in req.user)) {
    throw new PermissionDeniedError('No id in user in given request.');
  }

  return String(req.user.id);
}

/**
 * Returns the roles of the user in the request if possible.
 *
 * Checks if the request contains a user and if that user has a `roles` property.
 * 
 * If any of the above preconditions is false a `PermissionDeniedError` is thrown.

 * @param req Request to check
 */
function assertUserWithRolesInRequest(req: Request): Role[] {
  if (!req.user) {
    throw new PermissionDeniedError('No user in given request.');
  }

  if (!('roles' in req.user)) {
    throw new PermissionDeniedError('No roles in user in given request.');
  }

  const userRoles: unknown = req.user['roles'];

  if (!Array.isArray(userRoles)) {
    throw new PermissionDeniedError('Roles in user in given request is not an Array.');
  }

  return userRoles;
}

function assertRequestHasIdParam(req: Request, middlewareName: string) {
  if (!req.params.id) {
    throw new Error(
      `${middlewareName} middleware must only be used in paths which have an 'id' parameter.`
    );
  }
}
