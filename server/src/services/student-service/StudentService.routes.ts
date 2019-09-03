import Router from 'express-promise-router';
import { Attendance } from 'shared/dist/model/Attendance';
import { Role } from 'shared/dist/model/Role';
import { Student } from 'shared/dist/model/Student';
import { validateAgainstAttendanceDTO } from 'shared/dist/validators/Attendance';
import {
  validateAgainstPresentationPointsDTO,
  validateAgainstStudentDTO,
} from 'shared/dist/validators/Student';
import { checkRoleAccess } from '../../middleware/AccessControl';
import { validateRequestBody } from '../../middleware/Validation';
import studentService from './StudentService.class';
import { validateAgainstUpdatePointsDTO } from 'shared/dist/validators/Sheet';

const studentRouter = Router();

// TODO: Add access of Tutor to it's students (all paths!).
studentRouter.get('/', ...checkRoleAccess(Role.ADMIN), async (_, res) => {
  const students: Student[] = await studentService.getAllStudents();

  return res.json(students);
});

studentRouter.post(
  '/',
  ...checkRoleAccess(Role.ADMIN),
  validateRequestBody(validateAgainstStudentDTO, 'Not a valid StudentDTO.'),
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
  validateRequestBody(validateAgainstStudentDTO, 'Not a valid StudentDTO.'),
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
  validateRequestBody(validateAgainstAttendanceDTO, 'Not a valid StudentDTO.'),
  async (req, res) => {
    const id = req.params.id;
    const dto = req.body;

    const attendance: Attendance = await studentService.setAttendance(id, dto);

    res.json(attendance);
  }
);

studentRouter.put(
  '/:id/points', // TODO: Rename to /point
  ...checkRoleAccess(Role.ADMIN),
  validateRequestBody(validateAgainstUpdatePointsDTO, 'Not a valid UpdatePointsDTO.'),
  async (req, res) => {
    const id = req.params.id;
    const dto = req.body;

    await studentService.setPoints(id, dto);

    res.status(204).send();
  }
);

studentRouter.put(
  '/:id/examresult',
  ...checkRoleAccess(Role.ADMIN),
  validateRequestBody(validateAgainstUpdatePointsDTO, 'Not a valid UpdatePointsDTO.'),
  async (req, res) => {
    const id = req.params.id;
    const dto = req.body;

    await studentService.setExamResults(id, dto);

    res.status(204).send();
  }
);

studentRouter.put(
  '/:id/presentation',
  ...checkRoleAccess(Role.ADMIN),
  validateRequestBody(validateAgainstPresentationPointsDTO, 'Not a valid PresentationPointsDTO.'),
  async (req, res) => {
    const id = req.params.id;
    const dto = req.body;

    await studentService.setPresentationPoints(id, dto);

    res.status(204).send();
  }
);

export default studentRouter;
