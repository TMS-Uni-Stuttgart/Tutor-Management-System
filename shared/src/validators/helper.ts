import * as Yup from 'yup';
import { ValidationErrorsWrapper, ValidationErrorExtract } from '../model/errors/Errors';

export function validateSchema<T extends object>(
  schema: Yup.Schema<T>,
  obj: any
): Yup.Shape<object, T> | ValidationErrorsWrapper {
  try {
    const result: Yup.Shape<object, T> = schema.validateSync(obj, {
      abortEarly: false,
    });
    return result;
  } catch (err) {
    if (!(err instanceof Yup.ValidationError)) {
      throw err;
    }

    return { errors: getErrorExtracts(err) };
  }
}

export function getErrorExtracts(err: Yup.ValidationError): ValidationErrorExtract[] {
  const errors: ValidationErrorExtract[] = [];

  err.inner.forEach(({ path, message }) => {
    errors.push({ path, message });
  });

  return errors;
}
