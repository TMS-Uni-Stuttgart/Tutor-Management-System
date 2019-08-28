import * as Yup from 'yup';
import { validateSchema } from './helper';
import { ValidationErrorsWrapper } from '../model/errors/Errors';
import { SheetDTO, ExerciseDTO } from '../model/Sheet';

const ExerciseDTOSchema = Yup.object().shape<ExerciseDTO>({
  exNo: Yup.number().required(),
  maxPoints: Yup.number().required(),
  bonus: Yup.boolean().required(),
});

const SheetDTOSchema = Yup.object().shape<SheetDTO>({
  sheetNo: Yup.number().required(),
  bonusSheet: Yup.boolean().required(),
  exercises: Yup.array().of(ExerciseDTOSchema),
});

export function validateAgainstSheetDTO(
  obj: any
): Yup.Shape<object, SheetDTO> | ValidationErrorsWrapper {
  return validateSchema(SheetDTOSchema, obj);
}
