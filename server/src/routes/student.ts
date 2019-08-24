import { Router } from 'express';
import { ValidationErrors } from 'shared/dist/model/errors/Errors';
import { Role } from 'shared/dist/model/Role';
import { Student, StudentDTO } from 'shared/dist/model/Student';
import { validateAgainstStudentDTO } from 'shared/dist/validators/Student';
import { checkRoleAccess } from '../middleware/AccessControl';
import { handleError, ValidationErrorResponse } from '../model/Errors';
import studentService from '../services/StudentService';

function isValidStudentDTO(obj: any, errors: ValidationErrors): obj is StudentDTO {
  const result = validateAgainstStudentDTO(obj);

  if ('errors' in result) {
    errors.push(...result['errors']);
    return false;
  }

  return true;
}

const studentRouter = Router();

// TODO: Add access of Tutor to it's students (all paths!).
studentRouter.get('/', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const students: Student[] = await studentService.getAllStudents();

  return res.json(students);
});

studentRouter.post('/', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const dto = req.body;
  const errors: ValidationErrors = [];

  if (!isValidStudentDTO(dto, errors)) {
    return res.status(400).send(new ValidationErrorResponse('Not a valid StudentDTO', errors));
  }

  try {
    const student = await studentService.createStudent(dto);

    return res.json(student);
  } catch (err) {
    handleError(err, res);
  }
});

studentRouter.get('/:id', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const id = req.params.id;
  const student = await studentService.getStudentWithId(id);

  return res.json(student);
});

studentRouter.patch('/:id', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const id = req.params.id;
  const dto = req.body;
  const errors: ValidationErrors = [];

  if (!isValidStudentDTO(dto, errors)) {
    return res.status(400).send(new ValidationErrorResponse('Not a valid StudentDTO', errors));
  }

  try {
    const student = await studentService.updateStudent(id, dto);

    return res.json(student);
  } catch (err) {
    handleError(err, res);
  }
});

studentRouter.delete('/:id', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  try {
    const id = req.params.id;
    await studentRouter.delete(id);

    res.status(204).send();
  } catch (err) {
    handleError(err, res);
  }
});

export default studentRouter;
