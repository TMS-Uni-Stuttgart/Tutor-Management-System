import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { StudentDocument } from '../database/models/student.model';
import { StudentService } from '../module/student/student.service';
import { TutorialService } from '../module/tutorial/tutorial.service';
import { HasRoleGuard } from './has-role.guard';
import { TutorialGuard } from './tutorial.guard';

/**
 * Checks if the request is made on a student ID which the logged in user is allowed to access (ie is the tutor of).
 *
 * By default the `id` param is assumend to be the one belonging to the student. If the student ID is in a different param field one can set that field with the `@IDField()` decorator.
 *
 * By default, any user with the ADMIN role will get access to the endpoint. The roles getting access immediatly can be configured with the `@Roles()` decorator.
 *
 * By default, only the tutor of the tutorial of the student gains access to the endpoint. However, one can configure this with the `@AllowSubstitutes()` and `@AllowCorrectors()` decorators.
 */
@Injectable()
export class StudentGuard extends TutorialGuard {
    constructor(
        private readonly studentService: StudentService,
        tutorialService: TutorialService,
        reflector: Reflector
    ) {
        super(tutorialService, reflector);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const hasRoleGuard = new HasRoleGuard(this.reflector);

        if (hasRoleGuard.canActivate(context)) {
            return true;
        }

        const user = this.getUserFromRequest(context);
        const student = await this.getStudentFromRequest(context);

        return this.hasUserAccessToTutorial({
            user,
            context,
            tutorial: student.tutorial,
        });
    }

    private async getStudentFromRequest(context: ExecutionContext): Promise<StudentDocument> {
        const studentId = this.getIdFieldContentFromContext(context);

        return this.studentService.findById(studentId);
    }
}
