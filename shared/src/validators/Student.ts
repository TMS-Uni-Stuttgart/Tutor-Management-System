import * as Yup from 'yup';
import { ValidationErrorsWrapper } from '../model/errors/Errors';
import { validateSchema } from './helper';
import { StudentDTO, PresentationPointsDTO } from '../model/Student';

const StudentDTOSchema = Yup.object().shape<StudentDTO>({
  courseOfStudies: Yup.string().required(),
  email: Yup.string().required(),
  firstname: Yup.string().required(),
  lastname: Yup.string().required(),
  matriculationNo: Yup.string()
    .required()
    .length(7),
  team: Yup.string().nullable(),
  tutorial: Yup.string().required(),
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
