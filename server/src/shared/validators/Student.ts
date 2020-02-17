import * as Yup from 'yup';
import { ValidationErrorsWrapper } from '../model/errors/Errors';
import { validateSchema, YupIdShape } from './helper';
import { IStudentDTO, PresentationPointsDTO, CakeCountDTO, StudentStatus } from '../model/Student';

const StudentDTOSchema = Yup.object().shape<IStudentDTO>({
  courseOfStudies: Yup.string(),
  email: Yup.string(),
  firstname: Yup.string().required(),
  lastname: Yup.string().required(),
  matriculationNo: Yup.string(),
  team: YupIdShape.notRequired(),
  tutorial: YupIdShape.required(),
  status: Yup.mixed<StudentStatus>().required(),
});

const PresentationPointsDTOSchema = Yup.object().shape<PresentationPointsDTO>({
  points: Yup.number()
    .required()
    .min(0),
  sheetId: Yup.string().required(),
});

const CakeCountDTOSchema = Yup.object().shape<CakeCountDTO>({
  cakeCount: Yup.number()
    .min(0)
    .required(),
});

export function validateAgainstStudentDTO(
  obj: any
): Yup.Shape<object, IStudentDTO> | ValidationErrorsWrapper {
  return validateSchema(StudentDTOSchema, obj);
}

export function validateAgainstPresentationPointsDTO(
  obj: any
): Yup.Shape<object, PresentationPointsDTO> | ValidationErrorsWrapper {
  return validateSchema(PresentationPointsDTOSchema, obj);
}

export function validateAgainstCakeCountDTO(
  obj: any
): Yup.Shape<object, CakeCountDTO> | ValidationErrorsWrapper {
  return validateSchema(CakeCountDTOSchema, obj);
}
