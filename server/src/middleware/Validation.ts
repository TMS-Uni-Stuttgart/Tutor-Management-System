import { ValidationErrors } from 'shared/dist/model/errors/Errors';
import { RequestHandler } from 'express';
import { ValidationErrorResponse } from '../model/Errors';

/**
 * Validates the request body of the given request with the given function.
 *
 * If validation fails a 400 response is send back containing a `ValidationErrorResponse` including the given error message and the errors collected from the validator function.
 *
 * If validation succeeds the `next()` function is called and the request will continue.
 *
 * @param validator Function which validates the given request body.
 * @param errorMessage Error message to send in the response if validation fails.
 */
export function validateRequestBody<T>(
  validator: (obj: any, errors: ValidationErrors) => obj is T,
  errorMessage: string
): RequestHandler {
  return (req, res, next) => {
    const body = req.body;
    const errors: ValidationErrors = [];

    if (!validator(body, errors)) {
      return res.status(400).send(new ValidationErrorResponse(errorMessage, errors));
    }

    next();
  };
}
