import * as Yup from 'yup';
import { AttendanceDTO, AttendanceState } from '../model/Attendance';
import { ValidationErrorsWrapper } from '../model/errors/Errors';
import { validateSchema } from './helper';
import { isValid } from 'date-fns';

const AttendanceDTOSchema = Yup.object().shape<AttendanceDTO>({
  date: Yup.string()
    .test({
      test: value => isValid(new Date(value)),
    })
    .required(),
  note: Yup.string(),
  state: Yup.mixed<AttendanceState | undefined>().oneOf([
    ...Object.values(AttendanceState),
    null,
    undefined,
  ]),
});

export function validateAgainstAttendanceDTO(
  obj: any
): Yup.Shape<object, AttendanceDTO> | ValidationErrorsWrapper {
  return validateSchema(AttendanceDTOSchema, obj);
}
