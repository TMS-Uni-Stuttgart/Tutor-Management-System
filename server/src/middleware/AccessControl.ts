import { NextFunction, Request, RequestHandler, Response } from 'express';
import { Role } from 'shared/dist/model/Role';
import { getIdOfDocumentRef } from '../helpers/documentHelpers';
import { TutorialDocument } from '../model/documents/TutorialDocument';
import { PermissionDeniedError, BadRequestError } from '../model/Errors';
import tutorialService from '../services/tutorial-service/TutorialService.class';
import studentService from '../services/student-service/StudentService.class';
import { UserDocument } from '../model/documents/UserDocument';

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

  const user: UserDocument = assertUserWithIdInRequest(req);

  if (user.id === req.params.id) {
    req.hasAccess = true;
  }

  next();
}

/**
 * Checks if the user in the request is the tutor of the targeted tutorial.
 *
 * This middleware must only be used on paths with a `tutorialId` or an `id` parameter in it or else an `Error` will be thrown.
 *
 * If the user in the request is the tutor of the tutorial than `req.hasAccess` will be set to `true`.
 *
 * @param req Request object
 * @param res Response object (not used)
 * @param next Next function
 */
export async function isUserTutorOfTutorial(req: Request, _: Response, next: NextFunction) {
  assertRequestHasTutorialParam(req, 'isUserTutorOfTutorial()');

  if (req.hasAccess) {
    return next();
  }

  const user = assertUserWithIdInRequest(req);
  const tutorial = await getTutorialFromRequest(req);

  if (tutorial.isTutor(user)) {
    req.hasAccess = true;
  }

  next();
}

/**
 * Checks if the user in the request is a substitute of the targeted tutorial.
 *
 * This middleware must only be used on paths with a `tutorialId` or an `id` parameter in it or else an `Error` will be thrown.
 *
 * If the user in the request is a substitute tutor of the tutorial than `req.hasAccess` will be set to `true`.
 *
 * @param req Request object
 * @param res Response object (not used)
 * @param next Next function
 */
export async function isUserSubstituteOfTutorial(req: Request, _: Response, next: NextFunction) {
  assertRequestHasTutorialParam(req, 'isUserSubstituteOfTutorial()');

  const user = assertUserWithIdInRequest(req);
  const tutorial = await getTutorialFromRequest(req);

  if (tutorial.isSubstitute(user)) {
    req.hasAccess = true;
  }

  next();
}

/**
 * Checks if the user in the request is a corrector of the targeted tutorial.
 *
 * This middleware must only be used on paths with a `tutorialId` or an `id` parameter in it or else an `Error` will be thrown.
 *
 * If the user in the request is a corrector of the tutorial than `req.hasAccess` will be set to `true`.
 *
 * @param req Request object
 * @param res Response object (not used)
 * @param next Next function
 */
export async function isUserCorrectorOfTutorial(req: Request, _: Response, next: NextFunction) {
  assertRequestHasTutorialParam(req, 'isUserCorrectorOfTutorial()');

  const user = assertUserWithIdInRequest(req);
  const tutorial = await getTutorialFromRequest(req);

  if (tutorial.isCorrector(user)) {
    req.hasAccess = true;
  }

  next();
}

/**
 * Checks if the user in the request is a tutor of the targeted student.
 *
 * This middleware must only be used on paths with an `id` parameter in it or else an `Error` will be thrown.
 *
 * If the user in the request is a tutor of the student than `req.hasAccess` will be set to `true`.
 *
 * @param req Request object
 * @param res Response object (not used)
 * @param next Next function
 */
export async function isUserTutorOfStudent(req: Request, _: Response, next: NextFunction) {
  assertRequestHasIdParam(req, 'isUserTutorOfStudent()');

  if (req.hasAccess) {
    return next();
  }

  const user = assertUserWithIdInRequest(req);
  const tutorial = await getTutorialOfStudentFromRequest(req);

  if (tutorial.isTutor(user)) {
    req.hasAccess = true;
  }

  next();
}

/**
 * Checks if the user in the request is a corrector of the targeted student.
 *
 * This middleware must only be used on paths with an `id` parameter in it or else an `Error` will be thrown.
 *
 * If the user in the request is a corrector of the student than `req.hasAccess` will be set to `true`.
 *
 * @param req Request object
 * @param res Response object (not used)
 * @param next Next function
 */
export async function isUserCorrectorOfStudent(req: Request, _: Response, next: NextFunction) {
  assertRequestHasIdParam(req, 'isUserCorrectorOfStudent()');

  if (req.hasAccess) {
    return next();
  }

  const user = assertUserWithIdInRequest(req);
  const tutorial = await getTutorialOfStudentFromRequest(req);

  if (tutorial.isCorrector(user)) {
    req.hasAccess = true;
  }

  next();
}

/**
 * Checks if the user in the request is a substitute tutor of the targeted student.
 *
 * This middleware must only be used on paths with an `id` parameter in it or else an `Error` will be thrown.
 *
 * If the user in the request is a substitute tutor of the student than `req.hasAccess` will be set to `true`.
 *
 * @param req Request object
 * @param res Response object (not used)
 * @param next Next function
 */
export async function isUserSubstituteTutorOfStudent(
  req: Request,
  _: Response,
  next: NextFunction
) {
  assertRequestHasIdParam(req, 'isUserSubstituteTutorOfStudent()');

  if (req.hasAccess) {
    return next();
  }

  const user = assertUserWithIdInRequest(req);
  const tutorial = await getTutorialOfStudentFromRequest(req);

  if (tutorial.isSubstitute(user)) {
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

/**
 * Returns the tutorial belonging to the request.
 *
 * If the request already has a `tutorial` on it (ie from previous middleware functions) this one will be reused. However, if the request does NOT have such a tutorial the tutorial with the given ID will be fetched from the TutorialService.
 *
 * In the end `req.tutorial` will be set to this tutorial to make future calls within the same request faster.
 *
 * The request needs to have a `tutorialId` or an `id` param otherwise an `Error` will be thrown.
 *
 * @param req Request object
 */
async function getTutorialFromRequest(req: Request): Promise<TutorialDocument> {
  assertRequestHasTutorialParam(req, 'getTutorialFromRequest()');

  const tutorialId = req.params.tutorialId || req.params.id;

  if (!tutorialId) {
    throw new BadRequestError('Request does not contain a tutorialId nor an id property.');
  }

  const tutorial = req.tutorial
    ? req.tutorial
    : await tutorialService.getDocumentWithID(tutorialId);

  req.tutorial = tutorial;

  return tutorial;
}

async function getTutorialOfStudentFromRequest(req: Request): Promise<TutorialDocument> {
  assertRequestHasIdParam(req, 'getTutorialOfStudentFromRequest()');

  const studentId = req.params.id;
  const student = req.student ? req.student : await studentService.getDocumentWithId(studentId);
  const tutorial = req.tutorial
    ? req.tutorial
    : await tutorialService.getDocumentWithID(getIdOfDocumentRef(student.tutorial));

  req.tutorial = tutorial;
  req.student = student;

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
function assertUserWithIdInRequest(req: Request): UserDocument {
  if (!req.user) {
    throw new PermissionDeniedError('No user in given request.');
  }

  if (!('id' in req.user)) {
    throw new PermissionDeniedError('No id in user in given request.');
  }

  if (typeof req.user.id !== 'string') {
    throw new PermissionDeniedError('ID in user is not a string');
  }

  return req.user;
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

function assertRequestHasTutorialParam(req: Request, middlewareName: string) {
  if (!req.params.tutorialId && !req.params.id) {
    throw new Error(
      `${middlewareName} middleware must only be used in paths which have a 'tutorialId' or an 'id' parameter.`
    );
  }
}
