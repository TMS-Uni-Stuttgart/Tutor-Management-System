import Router from 'express-promise-router';
import { ValidationErrors } from 'shared/dist/model/errors/Errors';
import { Role } from 'shared/dist/model/Role';
import { Student, StudentDTO } from 'shared/dist/model/Student';
import { validateAgainstStudentDTO } from 'shared/dist/validators/Student';
import { validateAgainstAttendanceDTO } from 'shared/dist/validators/Attendance';
import studentService from './StudentService.class';
import { checkRoleAccess } from '../../middleware/AccessControl';
import { validateRequestBody } from '../../middleware/Validation';
import { Attendance, AttendanceDTO } from 'shared/dist/model/Attendance';

function isValidStudentDTO(obj: any, errors: ValidationErrors): obj is StudentDTO {
  const result = validateAgainstStudentDTO(obj);

  if ('errors' in result) {
    errors.push(...result['errors']);
    return false;
  }

  return true;
}

function isValidAttendanceDTO(obj: any, errors: ValidationErrors): obj is AttendanceDTO {
  const result = validateAgainstAttendanceDTO(obj);

  if ('errors' in result) {
    errors.push(...result['errors']);
    return false;
  }

  return true;
}

const studentRouter = Router();

// TODO: Add access of Tutor to it's students (all paths!).
studentRouter.get('/', ...checkRoleAccess(Role.ADMIN), async (_, res) => {
  const students: Student[] = await studentService.getAllStudents();

  return res.json(students);
});

studentRouter.post(
  '/',
  ...checkRoleAccess(Role.ADMIN),
  validateRequestBody(isValidStudentDTO, 'Not a valid StudentDTO.'),
  async (req, res) => {
    const dto = req.body;
    const student = await studentService.createStudent(dto);

    return res.json(student);
  }
);

studentRouter.get('/:id', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const id = req.params.id;
  const student = await studentService.getStudentWithId(id);

  return res.json(student);
});

studentRouter.patch(
  '/:id',
  ...checkRoleAccess(Role.ADMIN),
  validateRequestBody(isValidStudentDTO, 'Not a valid StudentDTO.'),
  async (req, res) => {
    const id = req.params.id;
    const dto = req.body;
    const student = await studentService.updateStudent(id, dto);

    return res.json(student);
  }
);

studentRouter.delete('/:id', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const id = req.params.id;
  await studentService.deleteStudent(id);

  res.status(204).send();
});

studentRouter.put(
  '/:id/attendance',
  ...checkRoleAccess(Role.ADMIN),
  validateRequestBody(isValidAttendanceDTO, 'Not a valid StudentDTO.'),
  async (req, res) => {
    const id = req.params.id;
    const dto = req.body;

    const attendance: Attendance = await studentService.setAttendance(id, dto);

    res.json(attendance);
  }
);

export default studentRouter;
