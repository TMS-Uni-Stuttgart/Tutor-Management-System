import { ValidationErrors } from 'shared/dist/validators/User';
import { Response } from 'express';

export interface StatusErrorMessages {
  [status: number]: string;
}

export class DocumentNotFoundError {
  constructor(readonly message: string) {}
}

export class ErrorResponse {
  constructor(readonly status: number, readonly message: string) {}
}

export class ValidationErrorResponse extends ErrorResponse {
  constructor(readonly message: string, readonly errors: ValidationErrors) {
    super(400, message);
  }
}

export function handleError(err: any, res: Response) {
  if (err instanceof DocumentNotFoundError) {
    return res.status(404).send(new ErrorResponse(404, err.message || 'Element was not found.'));
  }

  return res.status(500).send(new ErrorResponse(500, err.message || 'Internal server error.'));
}
