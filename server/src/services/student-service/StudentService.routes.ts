import Router from 'express-promise-router';
import { Attendance } from 'shared/dist/model/Attendance';
import { Role } from 'shared/dist/model/Role';
import { ScheinCriteriaSummary } from 'shared/dist/model/ScheinCriteria';
import { Student } from 'shared/dist/model/Student';
import { validateAgainstAttendanceDTO } from 'shared/dist/validators/Attendance';
import { validateAgainstUpdatePointsDTO } from 'shared/dist/validators/Sheet';
import {
  validateAgainstPresentationPointsDTO,
  validateAgainstStudentDTO,
} from 'shared/dist/validators/Student';
import {
  checkAccess,
  checkRoleAccess,
  hasUserOneOfRoles,
  isUserTutorOfStudent,
  isUserCorrectorOfStudent,
  isUserSubstituteTutorOfStudent,
} from '../../middleware/AccessControl';
import { validateRequestBody } from '../../middleware/Validation';
import scheincriteriaService from '../scheincriteria-service/ScheincriteriaService.class';
import studentService from './StudentService.class';

const studentRouter = Router();

studentRouter.get('/', ...checkRoleAccess([Role.ADMIN, Role.EMPLOYEE]), async (_, res) => {
  const students: Student[] = await studentService.getAllStudents();

  return res.json(students);
});

// TODO: Check if the user is created in 'own' tutorial by non-admins.
studentRouter.post(
  '/',
  ...checkRoleAccess([Role.ADMIN, Role.TUTOR]),
  validateRequestBody(validateAgainstStudentDTO, 'Not a valid StudentDTO.'),
  async (req, res) => {
    const dto = req.body;
    const student = await studentService.createStudent(dto);

    return res.status(201).json(student);
  }
);

studentRouter.get(
  '/:id',
  ...checkAccess(
    hasUserOneOfRoles([Role.ADMIN, Role.EMPLOYEE]),
    isUserTutorOfStudent,
    isUserCorrectorOfStudent,
    isUserSubstituteTutorOfStudent
  ),
  async (req, res) => {
    const id = req.params.id;
    const student = await studentService.getStudentWithId(id);

    return res.json(student);
  }
);

studentRouter.patch(
  '/:id',
  ...checkAccess(hasUserOneOfRoles(Role.ADMIN), isUserTutorOfStudent),
  validateRequestBody(validateAgainstStudentDTO, 'Not a valid StudentDTO.'),
  async (req, res) => {
    const id = req.params.id;
    const dto = req.body;
    const student = await studentService.updateStudent(id, dto);

    return res.json(student);
  }
);

studentRouter.delete(
  '/:id',
  ...checkAccess(hasUserOneOfRoles(Role.ADMIN), isUserTutorOfStudent),
  async (req, res) => {
    const id = req.params.id;
    await studentService.deleteStudent(id);

    res.status(204).send();
  }
);

studentRouter.put(
  '/:id/attendance',
  ...checkAccess(
    hasUserOneOfRoles(Role.ADMIN),
    isUserTutorOfStudent,
    isUserSubstituteTutorOfStudent
  ),
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
  ...checkAccess(hasUserOneOfRoles(Role.ADMIN), isUserTutorOfStudent, isUserCorrectorOfStudent),
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
  ...checkAccess(hasUserOneOfRoles(Role.ADMIN), isUserTutorOfStudent, isUserCorrectorOfStudent),
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
  ...checkAccess(
    hasUserOneOfRoles(Role.ADMIN),
    isUserTutorOfStudent,
    isUserSubstituteTutorOfStudent
  ),
  validateRequestBody(validateAgainstPresentationPointsDTO, 'Not a valid PresentationPointsDTO.'),
  async (req, res) => {
    const id = req.params.id;
    const dto = req.body;

    await studentService.setPresentationPoints(id, dto);

    res.status(204).send();
  }
);

studentRouter.get(
  '/:id/scheincriteria',
  ...checkAccess(hasUserOneOfRoles([Role.ADMIN, Role.EMPLOYEE]), isUserTutorOfStudent),
  async (req, res) => {
    const id = req.params.id;
    const result: ScheinCriteriaSummary = await scheincriteriaService.getCriteriaResultOfStudent(
      id
    );

    res.json(result);
  }
);

export default studentRouter;
