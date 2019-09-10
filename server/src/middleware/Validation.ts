import { RequestHandler } from 'express';
import { ValidationErrorsWrapper } from 'shared/dist/model/errors/Errors';
import * as Yup from 'yup';
import { ValidationError } from '../model/Errors';

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
export function validateRequestBody<T extends object>(
  validator: (obj: any) => Yup.Shape<object, T> | ValidationErrorsWrapper,
  errorMessage: string
): RequestHandler {
  return (req, _, next) => {
    const result = validator(req.body);

    if ('errors' in result) {
      throw new ValidationError(errorMessage, result.errors);
    }

    next();
  };
}
