import * as Yup from 'yup';
import { validateSchema } from './helper';
import { ValidationErrorsWrapper } from '../model/errors/Errors';
import { ExerciseDTOSchema } from './Sheet';
import { ScheinExamDTO } from '../model/Scheinexam';

const ScheinexamDTOSchema = Yup.object().shape<ScheinExamDTO>({
  scheinExamNo: Yup.number().required(),
  date: Yup.string()
    // .matches(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/)
    .required(),
  percentageNeeded: Yup.number()
    .min(0)
    .max(1)
    .required(),
  exercises: Yup.array().of(ExerciseDTOSchema),
});

export function validateAgainstScheinexamDTO(
  obj: any
): Yup.Shape<object, ScheinExamDTO> | ValidationErrorsWrapper {
  return validateSchema(ScheinexamDTOSchema, obj);
}
