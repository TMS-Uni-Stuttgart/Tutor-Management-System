import * as Yup from 'yup';
import { AttendanceDTO, AttendanceState } from '../model/Attendance';
import { ValidationErrorsWrapper } from '../model/errors/Errors';
import { validateSchema } from './helper';
import { isDate } from 'date-fns';

const AttendanceDTOSchema = Yup.object().shape<AttendanceDTO>({
  date: Yup.string()
    .test({ test: value => isDate(value) })
    .required(),
  note: Yup.string(),
  state: Yup.mixed<AttendanceState | undefined>().oneOf(Object.values(AttendanceState)),
});

export function validateAgainstAttendanceDTO(
  obj: any
): Yup.Shape<object, AttendanceDTO> | ValidationErrorsWrapper {
  return validateSchema(AttendanceDTOSchema, obj);
}
