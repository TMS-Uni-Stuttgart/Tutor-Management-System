import * as Yup from 'yup';
import { TutorialDTO } from '../model/Tutorial';
import { ValidationErrorsWrapper } from '../model/errors/Errors';
import { validateSchema } from './helper';

const TutorialDTOSchema = Yup.object().shape<TutorialDTO>({
  slot: Yup.number().required(),
  tutorId: Yup.string().notRequired(),
  correctorIds: Yup.array<string>(),
  dates: Yup.array<string>().required(),
  endTime: Yup.string().required(),
  startTime: Yup.string().required(),
});

export function validateAgainstTutorialDTO(
  obj: any
): Yup.Shape<object, TutorialDTO> | ValidationErrorsWrapper {
  return validateSchema(TutorialDTOSchema, obj);
}
