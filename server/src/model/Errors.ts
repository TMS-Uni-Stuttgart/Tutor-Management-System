import { NextFunction, Request, Response } from 'express';
import { ValidationErrorExtract } from 'shared/dist/model/errors/Errors';
import Logger from '../helpers/Logger';
import { isDevelopment } from '../helpers/isDevelopment';

export interface StatusErrorMessages {
  [status: number]: string;
}

export class StartUpError {
  constructor(readonly message: string) {}
}

export class AuthenticationError {
  constructor(readonly message: string) {}
}

export class PermissionDeniedError {
  constructor(readonly message?: string) {}
}

export class DocumentNotFoundError {
  constructor(readonly message: string) {}
}

export class EndpointNotFoundError {
  constructor(readonly message?: string) {}
}

export class BadRequestError {
  constructor(readonly message: string) {}
}

export class InvalidConfigurationError {
  constructor(readonly message?: string) {}
}

export class ValidationError {
  constructor(readonly message: string, readonly errors: ValidationErrorExtract[]) {}
}

export class TemplatesNotFoundError {
  get message(): string {
    return this.toString();
  }

  constructor(readonly notFoundTemplateNames: string[]) {}

  private toString(): string {
    return `Could not find the following template files: ${this.notFoundTemplateNames.join(', ')}`;
  }
}

class ErrorResponse {
  constructor(readonly status: number, readonly message: string) {}
}

class ValidationErrorResponse extends ErrorResponse {
  constructor(readonly message: string, readonly errors: ValidationErrorExtract[]) {
    super(400, message);
  }
}

export function handleError(err: any, req: Request, res: Response, next: NextFunction) {
  if (!err) {
    return next();
  }

  if (err instanceof AuthenticationError) {
    req.logout();
    return res
      .status(401)
      .send(new ErrorResponse(401, err.message || 'Error during authentication encountered.'));
  }

  Logger.error(err.message);

  if (err instanceof PermissionDeniedError) {
    return res.status(403).send(new ErrorResponse(403, 'Permission denied.'));
  }

  if (err instanceof DocumentNotFoundError) {
    return res.status(404).send(new ErrorResponse(404, err.message || 'Element was not found.'));
  }

  if (err instanceof EndpointNotFoundError) {
    return res
      .status(404)
      .send(new ErrorResponse(404, err.message || 'Requested API endpoint was not found.'));
  }

  if (err instanceof ValidationError) {
    return res.status(400).send(new ValidationErrorResponse(err.message, err.errors));
  }

  if (err instanceof BadRequestError) {
    return res.status(400).send(new ErrorResponse(400, err.message || 'The request is not valid.'));
  }

  if (err instanceof InvalidConfigurationError) {
    return res
      .status(500)
      .send(new ErrorResponse(500, err.message || 'The configuration of the server is invalid.'));
  }

  if (isDevelopment()) {
    Logger.error(err.stack);
  }

  return res.status(500).send(new ErrorResponse(500, err.message || 'Internal server error.'));
}
