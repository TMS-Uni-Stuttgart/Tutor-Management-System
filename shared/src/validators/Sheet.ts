import * as Yup from 'yup';
import { validateSchema, YupIdShape } from './helper';
import { ValidationErrorsWrapper } from '../model/errors/Errors';
import { SheetDTO, ExerciseDTO } from '../model/Sheet';
import { UpdatePointsDTO } from '../model/Points';

export const ExerciseDTOSchema = Yup.object().shape<ExerciseDTO>({
  exName: Yup.string().required(),
  maxPoints: Yup.number().required(),
  bonus: Yup.boolean().required(),
  subexercises: Yup.array(),
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
