import * as Yup from 'yup';
import { ScheinCriteriaDTO } from '../model/ScheinCriteria';
import { ValidationErrorsWrapper } from '../model/errors/Errors';
import { validateSchema } from './helper';

const ScheincriteriaDTOSchema = Yup.object().shape<ScheinCriteriaDTO>({
  identifier: Yup.string().required(),
  name: Yup.string().required(),
  data: Yup.object().required(),
});

export function validateAgainstScheincriteriaDTO(
  obj: any
): Yup.Shape<object, ScheinCriteriaDTO> | ValidationErrorsWrapper {
  return validateSchema(ScheincriteriaDTOSchema, obj);
}
