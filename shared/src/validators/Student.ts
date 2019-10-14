import * as Yup from 'yup';
import { ValidationErrorsWrapper } from '../model/errors/Errors';
import { validateSchema, YupIdShape } from './helper';
import { StudentDTO, PresentationPointsDTO } from '../model/Student';

const StudentDTOSchema = Yup.object().shape<StudentDTO>({
  courseOfStudies: Yup.string(),
  email: Yup.string(),
  firstname: Yup.string().required(),
  lastname: Yup.string().required(),
  matriculationNo: Yup.string().required(),
  team: YupIdShape.nullable(),
  tutorial: YupIdShape.required(),
});

const PresentationPointsDTOSchema = Yup.object().shape<PresentationPointsDTO>({
  points: Yup.number()
    .min(0)
    .required(),
  sheetId: Yup.string().required(),
});

export function validateAgainstStudentDTO(
  obj: any
): Yup.Shape<object, StudentDTO> | ValidationErrorsWrapper {
  return validateSchema(StudentDTOSchema, obj);
}

export function validateAgainstPresentationPointsDTO(
  obj: any
): Yup.Shape<object, PresentationPointsDTO> | ValidationErrorsWrapper {
  return validateSchema(PresentationPointsDTOSchema, obj);
}
