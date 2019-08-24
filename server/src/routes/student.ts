import { Router } from 'express';
import { ValidationErrors } from 'shared/dist/model/errors/Errors';
import { Role } from 'shared/dist/model/Role';
import { Student, StudentDTO } from 'shared/dist/model/Student';
import { validateAgainstStudentDTO } from 'shared/dist/validators/Student';
import { checkRoleAccess } from '../middleware/AccessControl';
import { handleError, ValidationErrorResponse } from '../model/Errors';
import studentService from '../services/StudentService';

function isValidStudentDTO(obj: any, errors: ValidationErrors): obj is StudentDTO {
  // TODO: Implement me!
  const result = validateAgainstStudentDTO(obj);

  if ('errors' in result) {
    errors.push(...result['errors']);
    return false;
  }

  return true;
}

const studentRouter = Router();

// TODO: Add access of Tutor to it's students.
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

export default studentRouter;
