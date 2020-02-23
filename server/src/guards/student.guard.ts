import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { HasRoleGuard } from './has-role.guard';
import { UseMetadata } from './helpers/UseMetadata';
import { StudentDocument } from '../database/models/student.model';
import { StudentService } from '../module/student/student.service';

/**
 * Checks if the request is made on a student ID which the logged in user is allowed to access (ie is the tutor of).
 *
 * By default the `id` param is assumend to be the one belonging to the student. If the student ID is in a different param field one can set that field with the `@IDField()` decorator.
 *
 * By default, any user with the ADMIN role will get access to the endpoint. The roles getting access immediatly can be configured with the `@Roles()` decorator.
 */
@Injectable()
export class StudentGuard extends UseMetadata {
  constructor(reflector: Reflector, private readonly studentService: StudentService) {
    super(reflector);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.getRolesFromContext(context);
    const hasRoleGuard = new HasRoleGuard(roles);

    if (hasRoleGuard.canActivate(context)) {
      return true;
    }

    const user = this.getUserFromRequest(context);
    const student = await this.getStudentFromRequest(context);

    // TODO: Support correctors and substitutes.
    return student.tutorial.tutor?.id === user._id;
  }

  private async getStudentFromRequest(context: ExecutionContext): Promise<StudentDocument> {
    const studentId = this.getIdFieldContentFromContext(context);

    return this.studentService.findById(studentId);
  }
}
