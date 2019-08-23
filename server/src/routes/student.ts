import { Router } from 'express';
import { ValidationErrors } from 'shared/dist/model/errors/Errors';
import { Role } from 'shared/dist/model/Role';
import { StudentDTO } from 'shared/dist/model/Student';
import { checkRoleAccess } from '../middleware/AccessControl';

function isValidStudentDTO(obj: any, errors: ValidationErrors): obj is StudentDTO {
  throw new Error('Not implemented yet');
}

const StudentRouter = Router();

StudentRouter.get('/', ...checkRoleAccess(Role.ADMIN), async (req, res) => {});

export default StudentRouter;
