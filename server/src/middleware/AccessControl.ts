import { NextFunction, Request, Response } from 'express';

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
