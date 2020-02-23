import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { HasRoleGuard } from './has-role.guard';
import { UseMetadata } from './helpers/UseMetadata';
import { StudentDocument } from '../database/models/student.model';
import { StudentService } from '../module/student/student.service';

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
