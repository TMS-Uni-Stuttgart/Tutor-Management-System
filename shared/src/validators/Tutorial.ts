import * as Yup from 'yup';
import { TutorialDTO, SubstituteDTO } from '../model/Tutorial';
import { ValidationErrorsWrapper } from '../model/errors/Errors';
import { validateSchema, YupIdShape } from './helper';

const TutorialDTOSchema = Yup.object().shape<TutorialDTO>({
  slot: Yup.number().required(),
  tutorId: YupIdShape.notRequired(),
  correctorIds: Yup.array<string>()
    .test({
      message: 'correctorIds must be present and be an array,',
      test: obj => obj && Array.isArray(obj),
    })
    .of(YupIdShape),
  dates: Yup.array<string>().required(),
  endTime: Yup.string().required(),
  startTime: Yup.string().required(),
});

const SubstituteDTOSchema = Yup.object().shape<SubstituteDTO>({
  tutorId: Yup.string().required(),
  dates: Yup.array<string>().required(),
});

export const TutorialIdListSchema = Yup.array().of(YupIdShape);

export function validateAgainstTutorialDTO(
  obj: any
): Yup.Shape<object, TutorialDTO> | ValidationErrorsWrapper {
  return validateSchema(TutorialDTOSchema, obj);
}

export function validateAgainstTutorialIdList(
  obj: any
): Yup.Shape<object, string[]> | ValidationErrorsWrapper {
  return validateSchema(TutorialIdListSchema, obj);
}

export function validateAgainstSubstituteDTO(
  obj: any
): Yup.Shape<object, SubstituteDTO> | ValidationErrorsWrapper {
  return validateSchema(SubstituteDTOSchema, obj);
}
