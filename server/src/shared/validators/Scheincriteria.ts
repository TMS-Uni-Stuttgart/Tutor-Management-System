import * as Yup from 'yup';
import { IScheinCriteriaDTO } from '../model/ScheinCriteria';
import { ValidationErrorsWrapper } from '../model/errors/Errors';
import { validateSchema } from './helper';

const ScheincriteriaDTOSchema = Yup.object().shape<IScheinCriteriaDTO>({
  identifier: Yup.string().required(),
  name: Yup.string().required(),
  data: Yup.object().required(),
});

export function validateAgainstScheincriteriaDTO(
  obj: any
): Yup.Shape<object, IScheinCriteriaDTO> | ValidationErrorsWrapper {
  return validateSchema(ScheincriteriaDTOSchema, obj);
}
