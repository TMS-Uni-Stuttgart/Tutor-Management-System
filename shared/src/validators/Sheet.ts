import * as Yup from 'yup';
import { ValidationErrorsWrapper } from '../model/errors/Errors';
import { UpdatePointsDTO } from '../model/Points';
import { ExerciseDTO, SheetDTO } from '../model/Sheet';
import { validateSchema } from './helper';

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
  points: Yup.mixed().required(),
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
