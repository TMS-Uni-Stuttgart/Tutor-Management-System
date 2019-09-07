import * as Yup from 'yup';
import { validateSchema, YupIdShape } from './helper';
import { ValidationErrorsWrapper } from '../model/errors/Errors';
import { SheetDTO, ExerciseDTO, UpdatePointsDTO } from '../model/Sheet';

export const ExerciseDTOSchema = Yup.object().shape<ExerciseDTO>({
  exNo: Yup.number().required(),
  maxPoints: Yup.number().required(),
  bonus: Yup.boolean().required(),
});

const SheetDTOSchema = Yup.object().shape<SheetDTO>({
  sheetNo: Yup.number().required(),
  bonusSheet: Yup.boolean().required(),
  exercises: Yup.array().of(ExerciseDTOSchema),
});

const UpdatePointsDTOSchema = Yup.object().shape<UpdatePointsDTO>({
  id: YupIdShape.required(),
  exercises: Yup.mixed().required(),
});

export function validateAgainstSheetDTO(
  obj: any
): Yup.Shape<object, SheetDTO> | ValidationErrorsWrapper {
  return validateSchema(SheetDTOSchema, obj);
}

export function validateAgainstUpdatePointsDTO(
  obj: any
): Yup.Shape<object, UpdatePointsDTO> | ValidationErrorsWrapper {
  return validateSchema(UpdatePointsDTOSchema, obj);
}
